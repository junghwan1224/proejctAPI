"use strict";

const axios = require("axios");

const CardInfo = require("../models").card_info;

const getToken = require("../public/js/getToken");

exports.readByUser = async (req, res) => {
    try {
        const { account_id } = req;

        const cardInfo = await CardInfo.findOne({
            where: { account_id }
        });

        if(cardInfo) {
            const { customer_uid } = cardInfo.dataValues;

            const token = await getToken();

            const getBilling = await axios({
                url: `https://api.iamport.kr/subscribe/customers/${customer_uid}`,
                method: 'GET',
                headers: {Authorization: token}
            });

            const { code, response } = getBilling.data;
            if(code === 0) {
                return res.status(200).send({ data: response });
            }
        }
        else {
            return res.status(200).send({ data: null });
        }
    }
    catch(err) {
        return res.status(400).send();
    }
};

exports.createByUser = async (req, res) => {
    try {
        const { account_id } = req;
        const { customer_uid } = req.body;

        await CardInfo.create({
            account_id,
            customer_uid
        });

        return res.status(201).send();
    }
    catch(err) {
        return res.status(400).send();
    }
};

exports.deleteByUser = async (req, res) => {
    try {
        const { account_id } = req;
        const { customer_uid } = req.headers;
    
        await CardInfo.destroy({
            where: {
                account_id,
                customer_uid
            }
        });

        return res.status(200).send();
    } catch (err) {
        console.log(err);
        res
          .status(400)
          .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
};