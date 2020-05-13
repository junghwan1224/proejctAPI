"use strict";

const axios = require("axios");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

const Order = require("../models").order;
const Account = require("../models").account;
const Product = require("../models").product;
const models = require("../models");

const updateMileage = require("./common/updateMileage");
const processStock = require("./common/processStock");
const getToken = require("./common/getToken");
const sendSMS = require("./common/sendSMS");
const { verifyToken } = require("../routes/verifyToken");

/* 일반 결제 */

// iamport-webhook
exports.webHookByUser = async (req, res) => {
  try {
    const { imp_uid, merchant_uid } = req.body;
    const transaction = await models.sequelize.transaction();

    // 아임포트 인증 토큰
    const token = await getToken();

    // imp_uid 값을 통해 아임포트 서버에서 가져온 결제 정보 조회
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get", // GET method
      headers: { Authorization: token }
    });

    // 결제 정보
    const paymentData = getPaymentData.data.response;
    const { amount, status } = paymentData;

    // DB에서 미리 저장된 결제 요청 정보
    const orderData = await Order.findAll({
      where: { merchant_uid },
      attributes: ["id", "product_id", "quantity", "status"],
      transaction
    });
    const orderedId = orderData.map(order => order.dataValues.id);
    const orderedProductId = orderData.map(
      order => order.dataValues.product_id
    );
    const orderedQuantity = orderData.map(order => order.dataValues.quantity);
    const orderStatus = orderData[0].dataValues.status;

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
            .send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
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
              transaction
            }
          );

          await transaction.commit();

          // 가상계좌 입금 완료 시 결제 완료 문자 전송
          if (orderStatus === "ready") {
            // 결제 완료 문자 전송
            const timestamp = new Date().getTime().toString();
            const products = await Product.findAll({
              where: { id: { [Op.in]: orderedProductId } }
            });
            const productOEN = products.map(p => p.dataValues.oe_number);
            const smsText = `${
              productOEN.length > 1
                ? `${productOEN[0]}외 ${productOEN.length - 1}종류`
                : productOEN[0]
            } 상품의 결제가 완료되었습니다.`;

            await sendSMS(smsText, user.dataValues.phone, timestamp);
          }

          res
            .status(200)
            .send({
              status: "success",
              message: "결제가 정상적으로 완료되었습니다."
            });
          break;
      }
    } else {
      // 결제 금액 불일치
      // order db 값 수정
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
        .send({ status: "forgery", message: "위조된 결제시도" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send();
  }
};

/* 정기결제 */
// issue-billing: 빌링키 발급
exports.createBillingKeyByUser = async (req, res) => {
  try {
    const {
      card_number, // 카드 번호
      expiry, // 카드 유효기간
      birthOrCRN, // 생년월일 혹은 사업자등록번호
      pwd_2digit // 카드 비밀번호 앞 두자리,
    } = req.body;

    const uniqueValue = new Date().getTime().toString().slice(5);
    const card_num_4digit = card_number.slice(0, 4);
    const customer_uid = `MONTAR_BILLING_KEY_${uniqueValue}${card_num_4digit}`; // 카드(빌링키)와 1:1로 대응하는 값

    // 아임포트 인증 토큰 발급
    const token = await getToken();

    // 빌링키 발급 요청
    const getBilling = await axios({
      url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      method: "post",
      headers: { Authorization: token },
      data: {
        card_number, // 카드 번호
        expiry, // 카드 유효기간
        birth: birthOrCRN, // 생년월일
        pwd_2digit // 카드 비밀번호 앞 두자리
      }
    });

    const { code, response } = getBilling.data;
    // response.card_name = 국민 KB 카드

    if (code === 0) {
      // 빌링키 발급 성공
      return res.status(201).send({
        customer_uid,
        card_name: response.card_name,
        card_number: response.card_number
      });
    }
    else {
      return res.status(400).send();
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send();
  }
};

// (delete) billing: 빌링키 삭제
exports.deleteBillingKeyByUser = async (req, res) => {
  try {
    const { customer_uid } = req.headers;

    const token = await getToken();

    const deleteBilling = await axios({
      url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
      method: "DELETE",
      headers: { Authorization: token }
    });

    const { code, message } = deleteBilling.data;

    if (code === 0) {
      return res.status(200).send({ message });
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send();
  }
};

// (post) billing: 빌링키로 결제
exports.billingByUser = async (req, res) => {
  try {
    const {
      isBillingWithKey, // true: again / false: onetime
      customer_uid,
      card_number,
      expiry,
      birth,
      pwd_2digit,

      merchant_uid,
      name,
      amount,
      buyer_name,
      buyer_tel,
      buyer_postcode,
      buyer_addr_primary,
      buyer_addr_detail
    } = req.body;
    const transaction = await models.sequelize.transaction();

    const { authorization } = req.headers;
    const account_id = authorization ? await verifyToken(authorization, "user") : "12345";

    // 아임포트 인증 토큰
    const token = await getToken();

    // 결제 정보 조회
    const orderData = await Order.findAll({
      where: { merchant_uid },
      attributes: ["id", "product_id", "quantity", "mileage"],
      transaction
    });
    const orderedId = orderData.map(order => order.dataValues.id);
    const orderedProductId = orderData.map(
      order => order.dataValues.product_id
    );
    const orderedQuantity = orderData.map(order => order.dataValues.quantity);

    const amountToBePaid = await Order.sum("amount", {
      where: { merchant_uid },
      transaction
    });

    // 결제 금액 비교
    // amount(finalAmount) === (제품들의 총 금액 - 마일리지)
    if (amount === amountToBePaid-orderData[0].dataValues.mileage) {
      // 요청한 금액과 db에 있는 금액과 일치하는 경우

      // 결제 요청
      // onetime api 와 again api를 분리
      // 이를 분리시키는 값을 받아온다.
      // 그 값을 통해 onetime / again 구분지어서 호출
      const billingData = isBillingWithKey ? {
        url: `https://api.iamport.kr/subscribe/payments/again`,
        method: "post",
        headers: { Authorization: token },
        data: {
          customer_uid,
          merchant_uid,
          name,
          amount,
          buyer_name,
          buyer_tel,
          buyer_addr: `${buyer_addr_primary} ${buyer_addr_detail}`,
          buyer_postcode
        }
      } : {
        url: `https://api.iamport.kr/subscribe/payments/onetime`,
        method: "post",
        headers: { Authorization: token },
        data: {
          card_number,
          expiry,
          birth,
          pwd_2digit,
          merchant_uid,
          name,
          amount,
          buyer_name,
          buyer_tel,
          buyer_addr: `${buyer_addr_primary} ${buyer_addr_detail}`,
          buyer_postcode
        }
      };

      const payWithBilling = await axios(billingData);

      const { code, message, response } = payWithBilling.data;

      if (code === 0) {
        // 결제 성공

        // 카드 정상 승인
        if (response.status === "paid") {
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

          const paidAt = new Date(response.paid_at * 1000);
          const parsedPaidAt = `${paidAt.getFullYear()}년 ${paidAt.getMonth()+1}월 ${paidAt.getDate()}일 ${paidAt.getHours()}시 ${paidAt.getMinutes()}분 ${paidAt.getSeconds()}초`;

          // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
          await Order.update(
            {
              imp_uid: response.imp_uid,
              status: "paid",
              paidAt: parsedPaidAt
            },
            {
              where: {
                id: { [Op.in]: orderedId }
              },
              merchant_uid,
              account_id,
              shipping_postcode: buyer_postcode,
              shipping_primary: buyer_addr_primary,
              shipping_detail: buyer_addr_detail,
              transaction
            }
          );

          if(authorization) {
            // 마일리지 업데이트
            await updateMileage(account_id, orderData[0].dataValues.mileage, amount, true, transaction);
          }

          await transaction.commit();

          // 결제 완료 문자 전송
          const timestamp = new Date().getTime().toString();
          const smsText = `주문번호[${merchant_uid.slice(7)}]\n${name} 상품의 결제가 완료되었습니다.`;

          await sendSMS(smsText, buyer_tel, timestamp);

          return res.status(200).send({ status: "success", message, response });
        }

        // 카드 승인 실패 (카드 한도 초과, 거래 정지 카드, 잔액 부족 등의 사유로 실패)
        else {
          await transaction.commit();

          return res.status(200).send({
            status: "failed",
            message:
              "카드 승인에 실패했습니다. 귀하의 카드가 한도 초과, 거래 정지, 잔액 부족 등에 해당되는지 확인 바랍니다."
          });
        }
      } else {
        // 결제 실패
        // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
        await Order.update(
          {
            status: "failed"
          },
          {
            where: {
              id: { [Op.in]: orderedId }
            },
            transaction
          }
        );

        await transaction.commit();

        return res.status(400).send({ status: "failed", message });
      }
    } else {
      // 결제 금액 불일치

      // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
      await Order.update(
        {
          imp_uid: response.imp_uid,
          status: "forgery"
        },
        {
          where: {
            product_id: { [Op.in]: orderedId }
          },
          transaction
        }
      );

      await transaction.commit();

      return res
        .status(400)
        .send({ status: "forgery", message: "위조된 결제시도" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send();
  }
};

/* 주문 취소 */
// cancel
exports.cancelByUser = async (req, res) => {
  try {
    const { phone, merchant_uid, reason } = req.body;

    const transaction = await models.sequelize.transaction();

    // 아임포트 인증 토큰 발급
    const token = await getToken();

    // imp_uid 값을 통해 결제 내역 조회
    const wouldBeRefundedOrder = await Order.findAll({
      where: {
        merchant_uid
      },
      transaction
    });
    const ordersArr = wouldBeRefundedOrder.map(order => order.dataValues.id);

    // 환불하고자 하는 금액
    const wantCancelAmount = await Order.sum("amount", {
      where: {
        id: { [Op.in]: ordersArr }
      },
      transaction
    }) - wouldBeRefundedOrder[0].dataValues.mileage;

    // 아임포트 REST API로 환불 요청
    // 가상계좌로 결제한 경우 - 환불 가상계좌 예금주, 환불 가상계좌 은행코드, 환불 가상계좌번호 필수 입력
    const cancelPayment = await axios({
      url: "https://api.iamport.kr/payments/cancel",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      data: {
        merchant_uid,
        reason,
        amount: wantCancelAmount
      }
    });

    // 환불 결과
    const { code } = cancelPayment.data;

    if (code === 0) {
      // order DB 값 업데이트 ... 금액 변경, status 처리
      await Order.update(
        {
          status: "cancelled"
        },
        {
          where: {
            id: { [Op.in]: ordersArr }
          },
          transaction
        }
      );

      await transaction.commit();

      const timestamp = new Date().getTime().toString();
      await sendSMS(`결제가 취소되었습니다.`, phone, timestamp);

      return res.status(200).send({
        status: "success",
        message: "결제취소 처리되었습니다.",
        receipt_url: cancelPayment.data.response.receipt_url
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
};

/* Admin API */

// (post) /ark/refund
exports.refundByAdmin = async (req, res) => {
  try {
    const {
      account_id,
      buyer_phone,
      imp_uid,
      order_name,
      reason // 환불 사유
    } = req.body;
    const transaction = await models.sequelize.transaction();

    // 아임포트 인증 토큰 발급
    const token = await getToken();

    // imp_uid 값을 통해 결제 내역 조회
    const wouldBeRefundedOrder = await Order.findAll({
      where: {
        imp_uid
      },
      transaction
    });
    const ordersArr = wouldBeRefundedOrder.map(order => order.dataValues.id);
    const refundedProductId = wouldBeRefundedOrder.map(
      order => order.dataValues.product_id
    );
    const refundedQuantity = wouldBeRefundedOrder.map(
      order => order.dataValues.quantity
    );

    // 환불하고자 하는 금액
    const wantCancelAmount = await Order.sum("amount", {
      where: {
        id: { [Op.in]: ordersArr },
        status: "paid"
      },
      transaction
    }) - wouldBeRefundedOrder[0].dataValues.mileage;

    // 이미 환불된 금액
    let cancelled = await Order.sum("amount", {
      where: {
        id: { [Op.in]: ordersArr },
        status: "cancelled"
      },
      transaction
    });

    // 환불된 금액이 없으면 null을 반환하므로 값 변경
    if (!cancelled) {
      cancelled = 0;
    }

    const totalAmount = await Order.sum("amount", {
      where: { imp_uid },
      transaction
    });

    // 환불 가능한 금액
    const cancelableAmount = (totalAmount-wouldBeRefundedOrder[0].dataValues.mileage) - cancelled;

    // checksum 파라미터 관련 로직
    if (cancelableAmount <= 0) {
      await transaction.commit();

      return res
        .status(200)
        .send({
          status: "amount over",
          message: "이미 전액환불된 주문입니다."
        });
    }

    // 아임포트 REST API로 환불 요청
    // 가상계좌로 결제한 경우 - 환불 가상계좌 예금주, 환불 가상계좌 은행코드, 환불 가상계좌번호 필수 입력
    const cancelPayment = await axios({
      url: "https://api.iamport.kr/payments/cancel",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      data: {
        imp_uid,
        reason,
        amount: wantCancelAmount,
        checksum: cancelableAmount
      }
    });

    // 환불 결과
    const { code } = cancelPayment.data;

    if (code === 0) {
      // 환불 성공인 경우

      // product DB 값 업데이트 ... 재고 업데이트
      const updatedProducts = await processStock(
        refundedProductId,
        refundedQuantity,
        false,
        transaction
      );

      await Product.bulkCreate(updatedProducts, {
        updateOnDuplicate: ["stock"],
        transaction
      });

      // order DB 값 업데이트 ... 금액 변경, status 처리
      await Order.update(
        {
          status: "cancelled"
        },
        {
          where: {
            id: { [Op.in]: ordersArr }
          },
          transaction
        }
      );

      const { mileage } = wouldBeRefundedOrder[0].dataValues;
      await updateMileage(account_id, mileage, wantCancelAmount-mileage, false, transaction);

      await transaction.commit();

      // 환불 완료 문자 전송
      const smsText = `주문번호[${wouldBeRefundedOrder[0].dataValues.merchant_uid.slice(7)}]\n${order_name} 상품의 결제가 완료되었습니다.`;
      const timestamp = new Date().getTime().toString();

      await sendSMS(smsText, buyer_phone, timestamp);

      return res.status(200).send({
        status: "success",
        message: "환불이 정상적으로 처리되었습니다.",
        receipt_url: cancelPayment.data.response.receipt_url
      });
    } else {
      // 환불 실패
      return res
        .status(403)
        .send({ status: "success", message: cancelPayment.data.message });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(403)
      .send();
  }
};