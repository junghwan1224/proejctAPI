"use strict";

const axios = require("axios");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

const Order = require("../models").order;
const Delivery = require("../models").delivery;
const Account = require("../models").account;
const Address = require("../models").address;
const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const models = require("../models");

const processStock = require("../public/js/processStock");
const getToken = require("../public/js/getToken");
const sendSMS = require("../public/js/sendSMS");

/* 일반 결제 */
// order-info
exports.readByUser = async (req, res) => {
    try {
        const { account_id } = req;
        const { order_id } = req.query;
        const transaction = await models.sequelize.transaction();

        const order = await Order.findOne({
            where: {
                account_id,
                merchant_uid: order_id
            },
            transaction
        });

        const price = await Order.sum("amount", {
            where: {
                account_id,
                merchant_uid: order_id
            },
            transaction
        });

        const delivery = await Delivery.findOne({
            where: {
                account_id,
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
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 페이지를 새로고침 해주세요." });
    }
};

// save-order
exports.createByUser = async (req, res) => {
    try {
        const { 
            merchant_uid,
            products,
            pay_method,
            name,
            amount, // array
            quantity,  // array
            address_id,
            buyer_email,
            addrArray, // buyer_addr
            buyer_postcode,
            memo
         } = req.body;
    
        const transaction = await models.sequelize.transaction();
    
        const { account_id } = req;
    
        const user = await Account.findOne({
            where: { id: account_id },
            transaction
        });
    
        const { email } = user.dataValues;
    
        // check stock of product
        const productsIdArr = products.split(",");
        const productsQuantityArr = quantity.split(",").map(q => parseInt(q));
        const productsAmountArr = amount.split(",").map(a => parseInt(a));
    
        const processedProducts = await processStock(productsIdArr, productsQuantityArr, true, transaction);
    
        // 요청한 수량보다 재고가 적은 abstract의 id를 배열에 저장
        const scarceProductsArr = processedProducts.reduce(
            (acc, product, idx) => {
                if(product.stock < 0) {
                    acc.push(idx);
                    return acc;
                }
                else {
                    return acc;
                }
            },
            []
        );
    
        // 재고가 부족한 제품이 있는 경우
        if(scarceProductsArr.length > 0) {
    
            // abstract_id 값으로 상품 조회
            const scarceProducts = await Product.findAll({
                where: {
                    abstract_id: { [Op.in]: scarceProductsArr }
                },
                transaction
            });
    
            await transaction.commit();
    
            return res.status(400).send({ api: "saveOrder", message: "재고 부족", scarceProducts });
        }
    
        // update to account email value
        // 이메일 주소가 다른 경우
        if(email !== buyer_email) {
            await Account.update({
                email: buyer_email
            },{
                where: { id: account_id },
                transaction
            });
        }
    
        //  update to account address value
        const parsedAddr = addrArray.split("&");
        // 입력된 주소가 없을 경우
        if(! parseInt(address_id)) {
            await Address.create({
                account_id,
                primary: parsedAddr[0],
                detail: parsedAddr[1],
                postcode: buyer_postcode
            }, {
                transaction
            });
        }
        // 입력된 주소가 있는 경우
        else {
            const addr = await Address.findOne({
                where: {
                    id: address_id,
                    account_id
                },
                attributes: ["postcode", "primary", "detail"],
                transaction
            });
       
            const optionInfoObj = {
                postcode: buyer_postcode,
                primary: parsedAddr[0],
                detail: parsedAddr[1],
            };
    
            // 입력된 주소가 있으나 수정한 경우
            if(! Object.is(JSON.stringify(addr.dataValues), JSON.stringify(optionInfoObj))) {
                await Address.update({
                    postcode: buyer_postcode,
                    primary: parsedAddr[0],
                    detail: parsedAddr[1],
                },
                {
                    where: { id: address_id, account_id },
                    transaction
                });
            }
        }
    
        // insert to DB
        const newOrderArray = productsIdArr.map(
            (product, idx) => {
                return {
                    merchant_uid,
                    account_id,
                    product_id: product,
                    name,
                    amount: (productsAmountArr[idx] * productsQuantityArr[idx]),
                    quantity: productsQuantityArr[idx],
                    pay_method,
                    status: "not paid",
                    memo
                };
            }
        );
        await Order.bulkCreate(newOrderArray, { transaction });
    
        await transaction.commit();
    
        res.status(201).send({ api: "saveOrder", message: "success" });
    }
    catch(err) {
        console.log(err);
        res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};

// complete
exports.updateByUser = async (req, res) => {
    try{
        const { imp_uid, merchant_uid } = req.body;
        const transaction = await models.sequelize.transaction();

        const { account_id } = req;

        const user = await Account.findOne({
            where: { id: account_id },
            transaction
        });

        // 아임포트 인증 토큰 발급
        const token = await getToken();

        // imp_uid 값을 통해 아임포트 서버에서 가져온 결제 정보 조회
        const getPaymentData = await axios({
                url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
                method: "get",
                headers: { "Authorization": token }
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
        const orderedProductId = orderData.map(order => order.dataValues.product_id);
        const orderedQuantity = orderData.map(order => order.dataValues.quantity);

        // DB에 저장된 해당 주문의 총 금액
        const amountToBePaid = await Order.sum("amount", {
            where: { merchant_uid },
            transaction
        });

        // paymentData에 있는 amount(금액)값 비교
        if(amount === amountToBePaid) {
            // 금액 일치하는 경우
            switch(status) {
                case "ready":
                    // 가상계좌 발급

                    await Order.update({
                        imp_uid,
                        status: "ready"
                    },
                    {
                        where: { 
                            id: { [Op.in]: orderedId }
                        },
                        transaction
                    });

                    await transaction.commit();

                    res.status(200).send({ api: "complete", status: "vbankIssued", message: "가상계좌 발급 성공" });
                    break;

                case "paid":
                    // 결제 완료
                    // product DB 값 업데이트 ... 재고 업데이트
                    const updatedProducts = await processStock(orderedProductId, orderedQuantity, true, transaction);
                
                    await ProductAbstract.bulkCreate(updatedProducts, { 
                        updateOnDuplicate: ["stock"],
                        transaction
                    });

                    // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
                    await Order.update({
                        imp_uid,
                        status: "paid"
                    },
                    {
                        where: { 
                            id: { [Op.in]: orderedId }
                        },
                        merchant_uid,
                        account_id,
                        transaction
                    });

                    await transaction.commit();

                    // 결제 완료 문자 전송
                    const timestamp = new Date().getTime().toString();
                    const products = await Product.findAll({
                        where: { id: { [Op.in]: orderedProductId } },
                    });
                    const productOEN = products.map( p => p.dataValues.oe_number);
                    const smsText = `${productOEN.length > 1 ? `${productOEN[0]}외 ${productOEN.length - 1}종류` : productOEN[0]} 상품의 결제가 완료되었습니다.`;

                    await sendSMS(smsText, user.dataValues.phone, timestamp);

                    res.status(200).send({ api: "complete", status: "success", message: "결제가 정상적으로 완료되었습니다." });
                    break;
            }
        }
        else {
            // 결제 금액 불일치
            await Order.update({
                imp_uid,
                status: "forgery"
            },
            {
                where: { 
                    id: { [Op.in]: orderedId }
                },
                transaction
            });

            await transaction.commit();

            return res.status(400).send({ api: "complete", status: "forgery", message: "위조된 결제시도" });
        }
    }
    catch(e) {
        console.log(e);
        return res.status(400).send({ api: "complete", status: "failed", message: "결제 시도 중 에러가 발생했습니다. 다시 시도해주세요." });
    }
};