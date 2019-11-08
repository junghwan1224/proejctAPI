const express = require("express");
const router = express.Router();
const axios = require("axios");
const asyncHandler = require('express-async-handler');
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");

const Order = require("../models").order;
const Account = require("../models").account;
const Address = require("../models").address;
const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const CardInfo = require("../models").card_info;
const models = require("../models");

const makeSignature = require("../public/js/signature");
const verifyToken = require("./verifyToken");

const { Op } = Sequelize;

const REST_API_KEY = process.env.IMPORT_REST_API_KEY;
const REST_API_SECRET = process.env.IMPORT_REST_API_SECRET;

const SENS_API_V2_URL = process.env.SENS_API_V2_URL + process.env.SENS_API_V2_URI;
const SENS_ACCESS_KEY = process.env.SENS_ACCESS_KEY;
const SENS_SENDER = process.env.SENS_SENDER;


/************ 일반 결제 ************/

// request_pay 메서드에서 결제 요청 성공 후 거래 검증 및 데이터 동기화
router.post("/complete", verifyToken, asyncHandler(async (req, res) => {
    try{
        const { imp_uid, merchant_uid } = req.body;
        const transaction = await models.sequelize.transaction();

        const { account_id } = req;

        const user = await Account.findOne({
            where: { id: account_id },
            transaction
        });

        // 아임포트 인증 토큰 발급
        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: {
            imp_key: REST_API_KEY,
            imp_secret: REST_API_SECRET
            }
        });

        // 인증 토큰
        const { access_token } = getToken.data.response;

        // imp_uid 값을 통해 아임포트 서버에서 가져온 결제 정보 조회
        const getPaymentData = await axios({
                url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
                method: "get",
                headers: { "Authorization": access_token }
        });

        // 결제 정보
        const paymentData = getPaymentData.data.response;
        const { amount, status } = paymentData;

        // DB에서 미리 저장된 결제 요청 정보
        const orderData = await Order.findAll({
            where: { merchant_uid },
            attributes: ["product_id", "quantity"],
            transaction
        });
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
                            product_id: { [Op.in]: orderedProductId }
                        },
                        transaction
                    });

                    await transaction.commit();

                    res.status(201).send({ api: "complete", status: "vbankIssued", message: "가상계좌 발급 성공" });
                    break;

                case "paid":
                    // 결제 완료
                    // product DB 값 업데이트 ... 재고 업데이트

                    // product_id 와 수량 묶어줌
                    const prodArr = orderedProductId.map((p, idx) => ({
                        "id": p,
                        "quantity": orderedQuantity[idx]
                    }));
                    // id 오름차순으로 정렬
                    prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
                
                    // abstract id 값 조회
                    const abstractsIds = await Product.findAll({
                        where: { id: { [Op.in]: prodArr.map(e => e.id) } },
                        include: [ProductAbstract],
                        transaction
                    });
                
                    const abstArr = abstractsIds.map(
                        product => {
                            const { dataValues } = product;
                            const { product_abstract } = dataValues;
                            const prop = product_abstract.dataValues;
                
                            return prop.id;
                        });
                    
                    // abstract id 와 수량 묶어줌
                    const abstObj = abstArr.map((abst, idx) => ({
                        "id": abst,
                        "quantity": prodArr[idx].quantity
                    }));
                
                    // 같은 id 값들인 경우 수량 합쳐줌
                    const abstractMap = abstObj.reduce((prev, cur) => {
                        let count = prev.get(cur.id) || 0;
                        prev.set(cur.id, cur.quantity + count);
                        return prev;
                    }, new Map());
                
                    // 배열로 만든 후 정렬
                    const mapToArr = [...abstractMap].map( ([id, quantity]) => { return {id, quantity} });
                    mapToArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
                
                    // 수량 업데이트
                    const abstracts = await ProductAbstract.findAll({
                        where: {
                            id: { [Op.in]: abstObj.map(e => e.id) }
                        },
                        transaction
                    });
                    const updatedProducts = abstracts.map(
                        product => {
                            return product.dataValues;
                        }
                    );
                
                    updatedProducts.forEach(
                    (product, idx) => {
                        product.stock -= mapToArr[idx].quantity;
                    }
                    );
                
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
                            product_id: { [Op.in]: orderedProductId }
                        },
                        transaction
                    });

                    // 결제 완료 문자 전송
                    const timestamp = new Date().getTime().toString();
                    const products = await Product.findAll({
                        where: { id: { [Op.in]: orderedProductId } },
                        transaction
                    });
                    const productOEN = products.map( p => p.dataValues.oe_number);
                    const smsText = `${productOEN.length > 1 ? `${productOEN[0]}외 ${productOEN.length - 1}종류` : productOEN[0]} 상품의 결제가 완료되었습니다.`;

                    await transaction.commit();

                    await axios({
                        url: SENS_API_V2_URL,
                        method: "post",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "x-ncp-apigw-timestamp": timestamp,
                            "x-ncp-iam-access-key": SENS_ACCESS_KEY,
                            "x-ncp-apigw-signature-v2": makeSignature(timestamp)
                        },
                        data: {
                            type: "SMS",
                            from: SENS_SENDER,
                            content: smsText,
                            messages: [{
                                to: user.dataValues.phone
                            }]
                        }
                    });

                    res.status(201).send({ api: "complete", status: "success", message: "결제가 정상적으로 완료되었습니다." });
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
                    product_id: { [Op.in]: orderedProductId }
                },
                transaction
            });

            await transaction.commit();

            return res.status(403).send({ api: "complete", status: "forgery", message: "위조된 결제시도" });
        }
    }
    catch(e) {
        console.log(e);
        return res.status(403).send({ status: "failed", message: "결제 시도 중 에러가 발생했습니다. 다시 시도해주세요." });
    }

}));

// 결제 요청 전, 요청할 주문 데이터 미리 저장 - 아임포트 서버에서 가져온 결제 정보와 비교하기 위함
router.post("/save-order", verifyToken, asyncHandler(async (req, res) => {
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

    const prodArr = productsIdArr.map((p, idx) => ({
        "id": p,
        "amount": productsAmountArr[idx],
        "quantity": productsQuantityArr[idx]
    }));
    prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });

    const abstractsIds = await Product.findAll({
        where: { id: { [Op.in]: prodArr.map(e => e.id) } },
        include: [ProductAbstract],
        transaction
    });

    const abstArr = abstractsIds.map(
        product => {
            const { dataValues } = product;
            const { product_abstract } = dataValues;
            const prop = product_abstract.dataValues;

            return prop.id;
        });
    
    const abstObj = abstArr.map((abst, idx) => ({
        "id": abst,
        "quantity": prodArr[idx].quantity
    }));

    const abstractMap = abstObj.reduce((prev, cur) => {
        let count = prev.get(cur.id) || 0;
        prev.set(cur.id, cur.quantity + count);
        return prev;
    }, new Map());

    const mapToArr = [...abstractMap].map( ([id, quantity]) => { return {id, quantity} });
    mapToArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });

    const abstracts = await ProductAbstract.findAll({
        where: {
            id: { [Op.in]: abstObj.map(e => e.id) }
        },
        transaction
    });

    // 요청한 수량보다 재고가 적은 abstract의 id를 배열에 저장
    const scarceProductsArr = abstracts.reduce(
        (acc, product, idx) => {
            if(product.dataValues.stock < mapToArr[idx].quantity) {
                acc.push(mapToArr[idx].id);
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

        return res.status(403).send({ api: "saveOrder", message: "재고 부족", scarceProducts });
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
    const parsedAddr = addrArray.split(",");
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
}));

// iamport webhook
// TODO: webhook 호출 시 SMS?
router.post("/iamport-webhook", asyncHandler(async (req, res) => {
        const { imp_uid, merchant_uid } = req.body;
        const transaction = await models.sequelize.transaction();

        // 아임포트 인증 토큰 발급
        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: {
              imp_key: REST_API_KEY,
              imp_secret: REST_API_SECRET
            }
        });

        // 인증 토큰
        const { access_token } = getToken.data.response;

        // imp_uid 값을 통해 아임포트 서버에서 가져온 결제 정보 조회
        const getPaymentData = await axios({
            url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
            method: "get", // GET method
            headers: { "Authorization": access_token }
        });

        // 결제 정보
        const paymentData = getPaymentData.data.response;
        const { amount, status } = paymentData;

        // DB에서 미리 저장된 결제 요청 정보
        const orderData = await Order.findAll({
            where: { merchant_uid },
            attributes: ["product_id", "quantity"],
            transaction
        });
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
                            product_id: { [Op.in]: orderedProductId }
                        },
                        transaction
                    });

                    await transaction.commit();

                    res.status(201).send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
                    break;

                case "paid":
                    // 결제 완료
                    // product DB 값 업데이트 ... 재고 업데이트
                    const prodArr = orderedProductId.map((p, idx) => ({
                        "id": p,
                        "quantity": orderedQuantity[idx]
                    }));
                    prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
                
                
                    const abstractsIds = await Product.findAll({
                        where: { id: { [Op.in]: prodArr.map(e => e.id) } },
                        include: [ProductAbstract],
                        transaction
                    });
                
                    const abstArr = abstractsIds.map(
                        product => {
                            const { dataValues } = product;
                            const { product_abstract } = dataValues;
                            const prop = product_abstract.dataValues;
                
                            return prop.id;
                        });
                    
                    const abstObj = abstArr.map((abst, idx) => ({
                        "id": abst,
                        "quantity": prodArr[idx].quantity
                    }));
                
                    const abstractMap = abstObj.reduce((prev, cur) => {
                        let count = prev.get(cur.id) || 0;
                        prev.set(cur.id, cur.quantity + count);
                        return prev;
                    }, new Map());
                
                    const mapToArr = [...abstractMap].map( ([id, quantity]) => { return {id, quantity} });
                    mapToArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
                
                    const abstracts = await ProductAbstract.findAll({
                        where: {
                            id: { [Op.in]: abstObj.map(e => e.id) }
                        },
                        transaction
                    });
                
                    const updatedProducts = abstracts.map(
                        product => {
                            return product.dataValues;
                        }
                    );
                
                    updatedProducts.forEach(
                     (product, idx) => {
                         product.stock -= mapToArr[idx].quantity;
                     }
                    );

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
                            product_id: { [Op.in]: orderedProductId }
                         },
                         transaction
                    });

                    await transaction.commit();

                    res.status(201).send({ status: "success", message: "결제가 정상적으로 완료되었습니다." });
                    break;
            }
        }

        else {
            // 결제 금액 불일치
            // order db 값 수정
            await Order.update({
                imp_uid,
                status: "forgery"
            },
            {
                where: { 
                    product_id: { [Op.in]: orderedProductId }
                },
                transaction
            });

            await transaction.commit();

            // throw { status: "forgery", message: "위조된 결제시도" };
            return res.status(403).send({ status: "forgery", message: "위조된 결제시도" });
        }

}));

/************ 정기 결제 - 카드 등록, 등록된 카드로 결제 요청 기능 ************/

// 카드 정보 customer_uid로 저장
router.post("/issue-billing", verifyToken, asyncHandler(async (req, res) => {
        const {
            card_number, // 카드 번호
            expiry, // 카드 유효기간
            birth, // 생년월일
            pwd_2digit, // 카드 비밀번호 앞 두자리,
        } = req.body;
        const transaction = await models.sequelize.transaction();

        const { account_id } = req;

        const user = await Account.findOne({
            where: { id: account_id },
            transaction
        });

        const account_phone = user.dataValues.phone;
        const card_num_4digit = card_number.slice(0, 4);
        const customer_uid = `HERMES_BILLING_KEY_${account_phone}_${card_num_4digit}`; // 카드(빌링키)와 1:1로 대응하는 값

        // 아임포트 인증 토큰 발급
        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: {
              imp_key: REST_API_KEY, 
              imp_secret: REST_API_SECRET 
            }
        });

        const { access_token } = getToken.data.response;

        // 빌링키 발급 요청
        const getBilling = await axios({
            url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
            method: "post",
            headers: { "Authorization": access_token },
            data: {
                card_number, // 카드 번호
                expiry, // 카드 유효기간
                birth, // 생년월일
                pwd_2digit, // 카드 비밀번호 앞 두자리
            }
        });

        const { code, message, response } = getBilling.data;
        // response.card_name = 국민 KB 카드

        if(code === 0) {
            // 빌링키 발급 성공
            // 빌링키를 사용할 때 필요한 customer_uid 값을 유저의 계정과 1:1(혹은 1:N)관계를 맺는 DB에 저장
            await CardInfo.create({
                account_id,
                customer_uid
            }, {
                transaction
            });

            await transaction.commit();

            return res.status(201).send({ 
                status: "success", 
                message: "Billing has successfully issued",
                customer_uid
             });
        }
        else {
            // 빌링키 발급 실패
            return res.status(403).send({ status: "failed", message });
        }
}));

router.delete("/delete-billing", verifyToken, asyncHandler(async (req, res) => {
    const { customer_uid } = req.body;

    const getToken = await axios({
        url: "https://api.iamport.kr/users/getToken",
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: {
          imp_key: REST_API_KEY, 
          imp_secret: REST_API_SECRET 
        }
    });

    const { access_token } = getToken.data.response;

    const deleteBilling = await axios({
        url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
        method: "DELETE",
        headers: { "Authorization": access_token }
    });

    const { code, message } = deleteBilling.data;

    if(code === 0) {
        await CardInfo.destroy({
            where: { customer_uid }
        });

        return res.status(201).send({ message });
    }
    else {
        return res.status(403).send({ message });
    }
}));

// 저장된 카드 정보로 결제하기
router.post("/billing", verifyToken, asyncHandler(async (req, res) => {
        const {
            customer_uid,
            merchant_uid,
            // product_id,
            name,
            amount,
            buyer_email,
            buyer_name,
            buyer_tel,
            buyer_addr,
            buyer_postcode
        } = req.body;
        const transaction = await models.sequelize.transaction();

        const { account_id } = req;

        const user = await Account.findOne({
            where: { id: account_id },
            transaction
        });

        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: {
              imp_key: REST_API_KEY, 
              imp_secret: REST_API_SECRET 
            }
        });
    
        const { access_token } = getToken.data.response;

        // 결제 정보 조회
        const orderData = await Order.findAll({
            where: { merchant_uid },
            attributes: ["product_id", "quantity"],
            transaction
        });
        const orderedProductId = orderData.map(order => order.dataValues.product_id);
        const orderedQuantity = orderData.map(order => order.dataValues.quantity);

        const amountToBePaid = await Order.sum("amount", {
            where: { merchant_uid },
            transaction
        });

        // 결제 금액 비교
        if(amount === amountToBePaid) {
            // 요청한 금액과 db에 있는 금액과 일치하는 경우

            // 결제 요청
            const payWithBilling = await axios({
                url: `https://api.iamport.kr/subscribe/payments/again`,
                method: "post",
                headers: { "Authorization": access_token },
                data: {
                    customer_uid,
                    merchant_uid,
                    name,
                    amount,
                    buyer_email,
                    buyer_name,
                    buyer_tel,
                    buyer_addr,
                    buyer_postcode
                }
            });
    
            const { code, message } = payWithBilling.data;
    
            if(code === 0) {
                // 결제 성공

                // 카드 정상 승인
                if(payWithBilling.status === "paid") {
                    // product DB 값 업데이트 ... 재고 업데이트
                    const prodArr = orderedProductId.map((p, idx) => ({
                        "id": p,
                        "quantity": orderedQuantity[idx]
                    }));
                    prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
                
                
                    const abstractsIds = await Product.findAll({
                        where: { id: { [Op.in]: prodArr.map(e => e.id) } },
                        include: [ProductAbstract],
                        transaction
                    });
                
                    const abstArr = abstractsIds.map(
                        product => {
                            const { dataValues } = product;
                            const { product_abstract } = dataValues;
                            const prop = product_abstract.dataValues;
                
                            return prop.id;
                        });
                    
                    const abstObj = abstArr.map((abst, idx) => ({
                        "id": abst,
                        "quantity": prodArr[idx].quantity
                    }));
                
                    const abstractMap = abstObj.reduce((prev, cur) => {
                        let count = prev.get(cur.id) || 0;
                        prev.set(cur.id, cur.quantity + count);
                        return prev;
                    }, new Map());
                
                    const mapToArr = [...abstractMap].map( ([id, quantity]) => { return {id, quantity} });
                    mapToArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
                
                    const abstracts = await ProductAbstract.findAll({
                        where: {
                            id: { [Op.in]: abstObj.map(e => e.id) }
                        },
                        transaction
                    });
                
                    const updatedProducts = abstracts.map(
                        product => {
                            return product.dataValues;
                        }
                    );
                
                    updatedProducts.forEach(
                    (product, idx) => {
                        product.stock -= mapToArr[idx].quantity;
                    }
                    );
                
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
                            product_id: { [Op.in]: orderedProductId }
                        },
                        transaction
                    });

                    // 결제 완료 문자 전송
                    const timestamp = new Date().getTime().toString();
                    const products = await Product.findAll({
                        where: { id: { [Op.in]: orderedProductId } },
                        transaction
                    });
                    const productOEN = products.map( p => p.dataValues.oe_number);
                    const smsText = `
                        ${productOEN.length > 1 ? `${productOEN[0]}외 ${productOEN.length - 1}개` : productOEN[0]} 상품의 결제가
                        완료되었습니다.
                    `;

                    await transaction.commit();

                    await axios({
                        url: SENS_API_V2_URL,
                        method: "post",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "x-ncp-apigw-timestamp": timestamp,
                            "x-ncp-iam-access-key": SENS_ACCESS_KEY,
                            "x-ncp-apigw-signature-v2": makeSignature(timestamp)
                        },
                        data: {
                            type: "SMS",
                            from: SENS_SENDER,
                            content: smsText,
                            messages: [{
                                to: user.dataValues.phone
                            }]
                        }
                    });
                    
                    return res.status(201).send({ status: "success", message });
                }

                // 카드 승인 실패 (카드 한도 초과, 거래 정지 카드, 잔액 부족 등의 사유로 실패)
                else { // payWithBilling.status === "failed"
                    // await transaction.commit();

                    return res.status(201).send({
                        status: "failed",
                        message: "카드 승인에 실패했습니다. 귀하의 카드가 한도 초과, 거래 정지, 잔액 부족 등에 해당되는지 확인 바랍니다."
                    });
                }

            }
            else {
                // 결제 실패

                // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
                await Order.update({
                    imp_uid,
                    status: "failed"
                },
                {
                    where: { 
                        product_id: { [Op.in]: orderedProductId }
                    },
                    transaction
                });

                await transaction.commit();

                return res.status(403).send({ status: "failed", message });
            }
        }

        else {
            // 결제 금액 불일치

            // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
            await Order.update({
                imp_uid,
                status: "forgery"
            },
            {
                where: { 
                    product_id: { [Op.in]: orderedProductId }
                },
                transaction
            });

            await transaction.commit();

            return res.status(403).send({ status: "forgery", message: "위조된 결제시도" });
        }

}));

/************ 주문 취소(환불) ************/
router.post("/refund", verifyToken, asyncHandler(async (req, res) => {
        const { 
            orders, // order ids in array
            merchant_uid,
            amount, // 환불 금액 -> 클라이언트에서 합산 후 요청
            reason, // 환불 사유
        } = req.body;
        const transaction = await models.sequelize.transaction();

        const { account_id } = req;

        const user = await Account.findOne({
            where: { id: account_id },
            transaction
        });

        // 아임포트 인증 토큰 발급
        const getToken = await axios({
            url: "https://api.iamport.kr/users/getToken",
            method: "post",
            headers: { "Content-Type": "application/json" },
            data: {
              imp_key: REST_API_KEY, 
              imp_secret: REST_API_SECRET
            }
        });

        const { access_token } = getToken.data.response;

        // merchant_uid 값을 통해 결제 내역 조회
        // imp_uid 추출
        const wouldBeRefundedOrder = await Order.findAll({
            where: {
                order_id: { [Op.in]: orders },
                merchant_uid
            },
            transaction
        });
        const { imp_uid } = wouldBeRefundedOrder[0].dataValues;
        const refundedProductId = wouldBeRefundedOrder.map(order => order.dataValues.product_id);
        const refundedQuantity = wouldBeRefundedOrder.map(order => order.dataValues.quantity);

        const cancelableAmount = await Order.sum("amount", {
            where: { 
                order_id: { [Op.in]: orders }
            },
            transaction
        });

        // checksum 파라미터 관련 로직
        // cancelableAmount = db에서 가져온 금액
        // cancelableAmount - amount <= 0 => message: "이미 전액 환불된 주문입니다."
        if(cancelableAmount - amount <= 0) {
            await transaction.commit();

            return res.status(201).send({status: "amount over", message: "이미 전액환불된 주문입니다."});
        }

        // 아임포트 REST API로 환불 요청
        // 가상계좌로 결제한 경우 - 환불 가상계좌 예금주, 환불 가상계좌 은행코드, 환불 가상계좌번호 필수 입력
        const cancelPayment = await axios({
            url: "https://api.iamport.kr/payments/cancel",
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": access_token
            },
            data: {
                imp_uid,
                merchant_uid,
                reason,
                amount,
                checksum: cancelableAmount
            }
        });

        // 환불 결과
        const { code } = cancelPayment.data;

        if(code === 0) {
            // 환불 성공인 경우

            // product DB 값 업데이트 ... 재고 업데이트
            const prodArr = refundedProductId.map((p, idx) => ({
                "id": p,
                "quantity": refundedQuantity[idx]
            }));
            prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
        
        
            const abstractsIds = await Product.findAll({
                where: { id: { [Op.in]: prodArr.map(e => e.id) } },
                include: [ProductAbstract],
                transaction
            });
        
            const abstArr = abstractsIds.map(
                product => {
                    const { dataValues } = product;
                    const { product_abstract } = dataValues;
                    const prop = product_abstract.dataValues;
        
                    return prop.id;
                });
            
            const abstObj = abstArr.map((abst, idx) => ({
                "id": abst,
                "quantity": prodArr[idx].quantity
            }));
        
            const abstractMap = abstObj.reduce((prev, cur) => {
                let count = prev.get(cur.id) || 0;
                prev.set(cur.id, cur.quantity + count);
                return prev;
            }, new Map());
        
            const mapToArr = [...abstractMap].map( ([id, quantity]) => { return {id, quantity} });
            mapToArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
        
            const abstracts = await ProductAbstract.findAll({
                where: {
                    id: { [Op.in]: abstObj.map(e => e.id) }
                },
                transaction
            });
        
            const updatedProducts = abstracts.map(
                product => {
                    return product.dataValues;
                }
            );
        
            updatedProducts.forEach(
             (product, idx) => {
                 product.stock += mapToArr[idx].quantity;
             }
            );
        
            await ProductAbstract.bulkCreate(updatedProducts, {
                updateOnDuplicate: ["stock"],
                transaction
            });

            // order DB 값 업데이트 ... 금액 변경, status 처리
            // TO THINK: amount는 0으로 바꿔야 하나?
            // TO THINK: amount 업데이트 없이 checksum 값 구하고 요청 받아온 amount 빼서 처리
            await Order.update(
                {
                    // amount: 0,
                    status: "refunded"
                },
                {
                    where: {
                        id: { [Op.in]: orders }
                    },
                    transaction
                }
            );

            // 환불 완료 문자 전송
            const timestamp = new Date().getTime().toString();

            const products = await Product.findAll({
                where: { id: { [Op.in]: refundedProductId } },
                transaction
            });
            const productOEN = products.map( p => p.dataValues.oe_number);
            const smsText = `
                ${productOEN.length > 1 ? `${productOEN[0]}외 ${productOEN.length - 1}개` : productOEN[0]} 상품 주문이
                취소되었습니다.
            `;

            await transaction.commit();

            await axios({
                url: SENS_API_V2_URL,
                method: "post",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "x-ncp-apigw-timestamp": timestamp,
                    "x-ncp-iam-access-key": SENS_ACCESS_KEY,
                    "x-ncp-apigw-signature-v2": makeSignature(timestamp)
                },
                data: {
                    type: "SMS",
                    from: SENS_SENDER,
                    content: smsText,
                    messages: [{
                        to: user.dataValues.phone
                    }]
                }
            });

            return res.status(201).send({
                stauts: "success",
                message: "환불이 정상적으로 처리되었습니다.",
                receipt_url: cancelPayment.data.response.receipt_url
            });
        }

        else {
            // 환불 실패
            // await transaction.commit();

            return res.status(403).send({ stauts: "success", message: "환불 실패" });
        }

}));

router.post("/issue-receipt", verifyToken, asyncHandler(async (req, res) => {
    const {
        order_id,
        identifier,
        identifier_type, // 현금영수증 발행대상 식별정보 유형
        // person - 주민등록번호 / business - 사업자등록번호 / phone - 연락처 / taxcard - 국세청 현금영수증카드
        type,
    } = req.body;
    const transaction = await models.sequelize.transaction();

    const { account_id } = req;

    const user = await Account.findOne({
        where: { id: account_id },
        transaction
    });

    const getToken = await axios({
        url: "https://api.iamport.kr/users/getToken",
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: {
          imp_key: REST_API_KEY, 
          imp_secret: REST_API_SECRET
        }
    });

    const { access_token } = getToken.data.response;

    const order = await Order.findOne({
        where: { id: order_id },
        transaction
    });
    const { imp_uid } = order.dataValues;

    const getReceipt = await axios({
        url: `https://api.iamport.kr/receipts/${imp_uid}`,
        method: "post",
        headers: { "Authorization": access_token },
        data: {
            imp_uid,
            identifier,
            identifier_type,
            type,
            buyer_name: user.dataValues.name,
            buyer_tel: user.dataValues.phone
        }
    });
    const { code } = getReceipt.data;

    if(code === 0) {
        await transaction.commit();

        return res.status(201).send({
            status: "success",
            message: "영수증 발급이 완료되었습니다.",
            receipt_url: getReceipt.data.response.receipt_url
        });
    }

    else {
        // await transaction.commit();

        return res.status(403).send({ status: "failed", message: "영수증 발급 도중 에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

module.exports = router;
