const express = require("express");
const router = express.Router();
const axios = require("axios");
const asyncHandler = require('express-async-handler');
const Sequelize = require("sequelize");

// 모델 정보를 migrations에서 아니면 models에서?
const Order = require("../models").order;
const Account = require("../models").account;
const Address = require("../models").address;
const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const CardInfo = require("../models").card_info;
const { Op } = Sequelize;

const REST_API_KEY = "9041452118972629";
const REST_API_SECRET =
  "f8DOKBoGDTN7s4fBXbjaPy6YNJLsEXdT5RIQs7w60ketot4mFnxuWDtKmfc1cqUiiC8KJFRKZ5dozhLe";

// TODO: https://api.iamport.kr CORS
// TODO: proxy 설정 후 이에 맞게 ajax url 변경

/************ 일반 결제 ************/

// request_pay 메서드에서 결제 요청 성공 후 거래 검증 및 데이터 동기화
// TODO: 계정 일치여부 확인 로직?
router.post("/complete", asyncHandler(async (req, res) => {
        const { imp_uid, merchant_uid } = req.body;

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
            attributes: ["product_id", "quantity"]
        });
        const orderedProductId = orderData.map(order => order.dataValues.product_id);
        const orderedQuantity = orderData.map(order => order.dataValues.quantity);

        // DB에 저장된 해당 주문의 총 금액
        const amountToBePaid = await Order.sum("amount", {
            where: { merchant_uid }
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
                         }
                    });
                    res.status(201).send({ status: "vbankIssued", message: "가상계좌 발급 성공" });
                    break;

                case "paid":
                    // 결제 완료
                    // product DB 값 업데이트 ... 재고 업데이트
                    // TODO: webhook이 호출 됐을 시 재고 처리가 두 번 동작되는지 체크

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
                        include: [ProductAbstract]
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
                
                    await ProductAbstract.bulkCreate(updatedProducts, { updateOnDuplicate: ["stock"] });

                    // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
                    await Order.update({
                        imp_uid,
                        status: "paid"
                    },
                    {
                        where: { 
                            product_id: { [Op.in]: orderedProductId }
                         }
                    });
                    res.status(201).send({ status: "success", message: "결제가 정상적으로 완료되었습니다." });
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
                 }
            });
            return res.status(403).send({ status: "forgery", message: "위조된 결제시도" });
        }

}));

// 결제 요청 전, 요청할 주문 데이터 미리 저장 - 아임포트 서버에서 가져온 결제 정보와 비교하기 위함
router.post("/save-order", asyncHandler(async (req, res) => {
    const { 
        account_uuid,
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

     const account = await Account.findOne({
         where: { uuid: account_uuid }
     });
     const account_id = account.dataValues.id;
     const { email } = account.dataValues;

    // check stock of product
    const productsIdArr = products.split(",").map(p => parseInt(p));
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
        include: [ProductAbstract]
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
            }
        });

        return res.status(403).send({ message: "재고 부족", scarceProducts });
    }

    // update to account email value
    // 이메일 주소가 다른 경우
    if(email !== buyer_email) {
        await Account.update({
            email: buyer_email
        },{
            where: { id: account_id }
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
        });
    }
    // 입력된 주소가 있는 경우
    else {
        const addr = await Address.findOne({
            where: {
                id: address_id,
                account_id
            },
            attributes: ["postcode", "primary", "detail"]
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
                where: { id: address_id, account_id }
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
    await Order.bulkCreate(newOrderArray);

    res.status(201).send({ message: "success" });
}));

// iamport webhook
router.post("/iamport-webhook", asyncHandler(async (req, res) => {
        const { imp_uid, merchant_uid } = req.body;

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
            attributes: ["product_id", "quantity"]
        });
        const orderedProductId = orderData.map(order => order.dataValues.product_id);
        const orderedQuantity = orderData.map(order => order.dataValues.quantity);

        // DB에 저장된 해당 주문의 총 금액
        const amountToBePaid = await Order.sum("amount", {
            where: { merchant_uid }
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
                         }
                    });
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
                        include: [ProductAbstract]
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

                    await ProductAbstract.bulkCreate(updatedProducts, { updateOnDuplicate: ["stock"] });

                    // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
                    await Order.update({
                        imp_uid,
                        status: "paid"
                    },
                    {
                        where: { 
                            product_id: { [Op.in]: orderedProductId }
                         }
                    });
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
                 }
            });

            // throw { status: "forgery", message: "위조된 결제시도" };
            return res.status(403).send({ status: "forgery", message: "위조된 결제시도" });
        }

}));

/************ 정기 결제 - 카드 등록, 등록된 카드로 결제 요청 기능 ************/

// 카드 정보 customer_uid로 저장
router.post("/issue-billing", asyncHandler(async (req, res) => {
        const {
            card_number, // 카드 번호
            expiry, // 카드 유효기간
            birth, // 생년월일
            pwd_2digit, // 카드 비밀번호 앞 두자리,
        } = req.body;

        const account_id = "";
        const account_phone = "";
        const card_num_4digit = card_number.slice(0, 4);
        const customer_uid = `HERMES_${account_phone}_${card_num_4digit}`; // 카드(빌링키)와 1:1로 대응하는 값

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
                account_id , // TODO: account_id 추가
                customer_uid
            });
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

router.delete("/delete-billing", asyncHandler(async (req, res) => {
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
// TODO: webhook?
router.post("/billing", asyncHandler(async (req, res) => {
        const {
            customer_uid, // TODO: 서버단에서 생성?
            // product_id,
            name,
            amount,
            buyer_email,
            buyer_name,
            buyer_tel,
            buyer_addr,
            buyer_postcode
        } = req.body;

        // 결제 정보 조회
        const orderData = await Order.findAll({
            where: { merchant_uid },
            attributes: ["product_id", "quantity"]
        });
        const orderedProductId = orderData.map(order => order.dataValues.product_id);
        const orderedQuantity = orderData.map(order => order.dataValues.quantity);

        const amountToBePaid = await Order.sum("amount", {
            where: { merchant_uid }
        });

        // 결제 금액 비교
        if(amount === amountToBePaid) {
            // 요청한 금액과 db에 있는 금액과 일치하는 경우

            // 결제 요청
            const payWithBilling = await axios({
                url: `https://api.iamport.kr/subscribe/payments/again`,
                method: "post",
                headers: { "Content-Type": "application/json" },
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

                // product DB 값 업데이트 ... 재고 업데이트
                const prodArr = orderedProductId.map((p, idx) => ({
                    "id": p,
                    "quantity": orderedQuantity[idx]
                }));
                prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
            
            
                const abstractsIds = await Product.findAll({
                    where: { id: { [Op.in]: prodArr.map(e => e.id) } },
                    include: [ProductAbstract]
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
            
                await ProductAbstract.bulkCreate(updatedProducts, { updateOnDuplicate: ["stock"] });

                // order DB 값 업데이트 ... imp_uid 값 추가, status 값 업데이트
                await Order.update({
                    imp_uid,
                    status: "paid"
                },
                {
                    where: { 
                        product_id: { [Op.in]: orderedProductId }
                     }
                });
                
                return res.status(201).send({ status: "success", message });
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
                     }
                });

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
                 }
            });

            return res.status(403).send({ status: "forgery", message: "위조된 결제시도" });
        }

}));

/************ 주문 취소(환불) ************/
// TODO: 상품 개별로 가능 - using order_id 
// TODO: 전체 환불도 가능
router.post("/refund", asyncHandler(async (req, res) => {
        const { 
            orders, // order ids in array
            merchant_uid,
            amount, // 환불 금액
            reason, // 환불 사유
        } = req.body;

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

        // TODO: 단일 상품, 복수 상품 조회시 어떻게 분리?
        // merchant_uid 값을 통해 결제 내역 조회
        // imp_uid 추출
        const wouldBeRefundedOrder = await Order.findAll({
            where: {
                order_id: { [Op.in]: orders },
                merchant_uid
             }
        });
        const { imp_uid } = wouldBeRefundedOrder[0].dataValues;
        const refundedProductId = wouldBeRefundedOrder.map(order => order.dataValues.id);
        const refundedQuantity = wouldBeRefundedOrder.map(order => order.dataValues.quantity);

        const cancelableAmount = await Order.sum("amount", {
            where: { 
                order_id: { [Op.in]: orders }
             }
        });

        // checksum 파라미터 관련 로직
        // cancelableAmount = db에서 가져온 금액 - amount
        // cancelableAmount < 0 => message: "이미 전액 환불된 주문입니다."
        if(cancelableAmount <= 0) {
            res.status(201).send({status: "amount over", message: "이미 전액환불된 주문입니다."});
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
        // TODO: response 값 확인
        const { response } = cancelPayment.data;
        if(true) { // TODO: 조건 수정
            // response - 환불 성공인 경우
            // TODO: 환불 결과에 따른 DB 값 동기화 - product 재고, order 테이블 금액, status 처리

            // product DB 값 업데이트 ... 재고 업데이트
            const prodArr = refundedProductId.map((p, idx) => ({
                "id": p,
                "quantity": refundedQuantity[idx]
            }));
            prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
        
        
            const abstractsIds = await Product.findAll({
                where: { id: { [Op.in]: prodArr.map(e => e.id) } },
                include: [ProductAbstract]
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
        
            await ProductAbstract.bulkCreate(updatedProducts, { updateOnDuplicate: ["stock"] });

            // order DB 값 업데이트 ... 금액 변경, status 처리
            await Order.update(
                {
                    amount: 0,
                    status: "refunded"
                },
                {
                    where: {
                        id: { [Op.in]: orders }
                    }
                }
            );

            return res.status(201).send({ stauts: "success", message: "환불이 정상적으로 처리되었습니다." });
        }

        else {
            // 환불 실패
            return res.status(403).send({ stauts: "success", message: "환불 실패" });
        }

}));

module.exports = router;
