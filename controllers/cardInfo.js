"use strict";

const CardInfo = require("../models").card_info;

exports.readByUser = async (req, res) => {
    try {
        const { account_id } = req;

        const cardInfo = await CardInfo.findAll({
            where: { account_id },
            attributes: ["customer_uid", "card_name", "card_number"]
        });

        if(cardInfo) {
            return res.status(200).send({ response: cardInfo });
        }
        else {
            return res.status(200).send({ response: null });
        }
    }
    catch(err) {
        return res.status(400).send();
    }
};

exports.createByUser = async (req, res) => {
    try {
        const { account_id } = req;
        const { customer_uid, card_name, card_number } = req.body;

        await CardInfo.create({
            account_id,
            customer_uid,
            card_name,
            card_number
        });

        return res.status(201).send({
            customer_uid,
            card_name,
            card_number
        });
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