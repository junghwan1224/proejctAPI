const axios = require("axios");
const Account = require("../models").account;

const getToken = require("./common/getToken");

exports.readByAdmin = async (req, res) => {
    try {
        const { merchant_uid } = req.query;

        const token = await getToken();

        const getReceipt = await axios({
            url: `https://api.iamport.kr/receipts/external/${merchant_uid}`,
            method: "get",
            headers: { "Authorization": token },
        });
        const { code } = getReceipt.data;

        if(code === 0) {
            return res.status(200).send({
                message: "영수증 발급이 완료되었습니다.",
                receipt_url: getReceipt.data.response.receipt_url
            });
        }
    }
    catch(err) {
        console.log(err);
        return res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요" });
    }
};

exports.createByAdmin = async (req, res) => {
    try {
        const {
            merchant_uid,
            account_id
        } = req.body;

        const user = await Account.findOne({
            where: { id: account_id }
        });
        const { name, phone, email, crn } = user.dataValues;

        // 제품 리스트 조회
        const orderedProduct = await Order.findAll({
            where: { merchant_uid }
        }).map(o => o.dataValues.product_id);

        // 제품들 oe number 조회
        const products = await Product.findAll({
            where: { [Op.in]: orderedProduct }
        }).map(p => p.dataValues.oe_number);

        // 주문명 1개 보다 많은 제품 구매시 ~~외 ~개 상품 문구 / 1개 구매 시 제품 oe number로 주문명 지정
        const orderName = products.length > 1 ? `${products[0]}외 ${products.length-1} 개 상품` : `${products[0]}`;

        const amount = await Order.sum("amount", {
            where: { merchant_uid }
        });

        const token = await getToken();

        const data = {
            name: orderName, // 주문명
            amount, // 계산 금액
            identifier: crn, // 현금영수증 발행대상 식별정보. 국세청현금영수증카드, 휴대폰번호, 주민등록번호, 사업자등록번호
            buyer_name: name, // 구매자 이름(강력권장)
            buyer_tel: phone // 구매자 연락처
        };

        if(email) {
            data.buyer_email = email; // 구매자 이메일
        }

        const getReceipt = await axios({
            url: `https://api.iamport.kr/receipts/external/${merchant_uid}`,
            method: "post",
            headers: { "Authorization": token },
            data
        });
        const { code } = getReceipt.data;

        if(code === 0) {
            return res.status(200).send({
                message: "영수증 발급이 완료되었습니다.",
                receipt_url: getReceipt.data.response.receipt_url
            });
        }
    }
    catch(err) {
        console.log(err);
        return res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요" });
    }
};