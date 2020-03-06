"use strict";

const axios = require("axios");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

const Order = require("../models").order;
const Delivery = require("../models").delivery;
const Product = require("../models").product;
const models = require("../models");

const processStock = require("../public/js/processStock");
const getToken = require("../public/js/getToken");
const sendSMS = require("../public/js/sendSMS");

/* 일반 결제 */
// order-info
exports.readByUser = async (req, res) => {
  try {
    const { order_id } = req.query;
    const transaction = await models.sequelize.transaction();

    const order = await Order.findOne({
      where: {
        merchant_uid: order_id
      },
      transaction
    });

    const price = await Order.sum("amount", {
      where: {
        merchant_uid: order_id
      },
      transaction
    });

    const delivery = await Delivery.findOne({
      where: {
        order_id
      },
      transaction
    });

    await transaction.commit();

    res.status(200).send({
      order: order.dataValues,
      price: price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      delivery: delivery.dataValues
    });
  } catch (err) {
    console.log(err);
    res
      .status(403)
      .send({ message: "에러가 발생했습니다. 페이지를 새로고침 해주세요." });
  }
};

// save-order
exports.createByUser = async (req, res) => {
  try {
    const {
      name,
      phone,
      merchant_uid,
      products,
      pay_method,
      amount, // array
      quantity, // array
      memo
    } = req.body;

    const transaction = await models.sequelize.transaction();
    const account_id = "12345";

    // check stock of product
    const productsIdArr = products.split(",");
    const productsQuantityArr = quantity.split(",").map(q => parseInt(q));
    const productsAmountArr = amount.split(",").map(a => parseInt(a));

    const processedProducts = await processStock(
      productsIdArr,
      productsQuantityArr,
      true,
      transaction
    );

    // 요청한 수량보다 재고가 적은 abstract의 id를 배열에 저장
    const scarceProductsArr = processedProducts.reduce((acc, product, idx) => {
      if (product.stock < 0) {
        acc.push(idx);
        return acc;
      } else {
        return acc;
      }
    }, []);

    // 재고가 부족한 제품이 있는 경우
    if (scarceProductsArr.length > 0) {
      // abstract_id 값으로 상품 조회
      const scarceProducts = await Product.findAll({
        where: {
          abstract_id: { [Op.in]: scarceProductsArr }
        },
        transaction
      });

      await transaction.commit();

      return res
        .status(400)
        .send({ api: "saveOrder", message: "재고 부족", scarceProducts });
    }

    // insert to DB
    const newOrderArray = productsIdArr.map((product, idx) => {
      return {
        merchant_uid,
        account_id,
        product_id: product,
        name,
        amount: productsAmountArr[idx] * productsQuantityArr[idx],
        quantity: productsQuantityArr[idx],
        pay_method,
        status: "not paid",
        memo: memo.concat(`\n **[주문자명: ${name}  연락처: ${phone}]`)
      };
    });
    await Order.bulkCreate(newOrderArray, { transaction });

    await transaction.commit();

    res.status(201).send({ api: "saveOrder", message: "success" });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

// complete
exports.updateByUser = async (req, res) => {
  try {
    const {
      phone,
      imp_uid,
      merchant_uid,
      shipping_postcode,
      shipping_primary,
      shipping_detail
    } = req.body;
    const transaction = await models.sequelize.transaction();
    const account_id = "12345";

    // 아임포트 인증 토큰 발급
    const token = await getToken();

    // imp_uid 값을 통해 아임포트 서버에서 가져온 결제 정보 조회
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get",
      headers: { Authorization: token }
    });

    // 결제 정보
    const paymentData = getPaymentData.data.response;
    const { amount, status } = paymentData;

    // DB에서 미리 저장된 결제 요청 정보
    const orderData = await Order.findAll({
      where: { merchant_uid },
      attributes: ["id", "product_id", "quantity"],
      transaction
    });
    const orderedId = orderData.map(order => order.dataValues.id);
    const orderedProductId = orderData.map(
      order => order.dataValues.product_id
    );
    const orderedQuantity = orderData.map(order => order.dataValues.quantity);

    // DB에 저장된 해당 주문의 총 금액
    const amountToBePaid = await Order.sum("amount", {
      where: { merchant_uid },
      transaction
    });

    // paymentData에 있는 amount(금액)값 비교
    if (amount === amountToBePaid) {
      // 금액 일치하는 경우
      switch (status) {
        case "ready":
          // 가상계좌 발급

          await Order.update(
            {
              imp_uid,
              status: "ready"
            },
            {
              where: {
                id: { [Op.in]: orderedId }
              },
              transaction
            }
          );

          await transaction.commit();

          res
            .status(200)
            .send({
              api: "complete",
              status: "vbankIssued",
              message: "가상계좌 발급 성공"
            });
          break;

        case "paid":
          // 결제 완료
          // product DB 값 업데이트 ... 재고 업데이트
          const updatedProducts = await processStock(
            orderedProductId,
            orderedQuantity,
            true,
            transaction
          );

          await Product.bulkCreate(updatedProducts, {
            updateOnDuplicate: ["stock"],
            transaction
          });

          // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
          await Order.update(
            {
              imp_uid,
              status: "paid"
            },
            {
              where: {
                id: { [Op.in]: orderedId }
              },
              merchant_uid,
              account_id,
              shipping_postcode,
              shipping_primary,
              shipping_detail,
              transaction
            }
          );

          await transaction.commit();

          // 결제 완료 문자 전송
          const timestamp = new Date().getTime().toString();
          const products = await Product.findAll({
            where: { id: { [Op.in]: orderedProductId } }
          });
          const productOEN = products.map(p => p.dataValues.oe_number);
          const smsText = `주문번호[${merchant_uid.slice(7)}]\n${
            productOEN.length > 1
              ? `${productOEN[0]}외 ${productOEN.length - 1}종류`
              : productOEN[0]
          } 상품의 결제가 완료되었습니다.`;

          await sendSMS(smsText, phone, timestamp);

          res
            .status(200)
            .send({
              api: "complete",
              status: "success",
              message: "결제가 정상적으로 완료되었습니다."
            });
          break;
      }
    } else {
      // 결제 금액 불일치
      await Order.update(
        {
          imp_uid,
          status: "forgery"
        },
        {
          where: {
            id: { [Op.in]: orderedId }
          },
          transaction
        }
      );

      await transaction.commit();

      return res
        .status(400)
        .send({
          api: "complete",
          status: "forgery",
          message: "위조된 결제시도"
        });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({
        api: "complete",
        status: "failed",
        message: "결제 시도 중 에러가 발생했습니다. 다시 시도해주세요."
      });
  }
};
