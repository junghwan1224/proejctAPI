const axios = require("axios");
const Account = require("../models").account;

const getToken = require("../public/js/getToken");

exports.readByUser = async (req, res) => {
    try {
        // req.query?
        const { imp_uid } = req.body;

        const token = await getToken();

        const getReceipt = await axios({
            url: `https://api.iamport.kr/receipts/${imp_uid}`,
            method: "get",
            headers: { "Authorization": token },
            data: { imp_uid }
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

exports.createByUser = async (req, res) => {
    try {
        const {
            imp_uid
        } = req.body;

        const { account_id } = req;

        const user = await Account.findOne({
            where: { id: account_id },
        });
        const { name, phone, email, crn } = user.dataValues;

        const token = await getToken();

        const data = {
            imp_uid,
            identifier: crn,
            buyer_name: name,
            buyer_tel: phone
        };

        if(email) {
            data.buyer_email = email;
        }

        const getReceipt = await axios({
            url: `https://api.iamport.kr/receipts/${imp_uid}`,
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