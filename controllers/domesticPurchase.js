"use strict"

const DomesticPurchase = require("../models").domestic_purchase;
const models = require("../models");

exports.readByAdmin = async (req, res) => {
    try {
        const { domestic_purchase_id } = req.query;

        const response = await DomesticPurchase.findOne({
            where: { id: domestic_purchase_id }
        });

        return res.status(200).send(response);
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.createByAdmin = async (req, res) => {
    try {
        const {
            supplier_id,
            product_id,
            staff_id,
            quantity,
            price
        } = req.body;

        if(! (supplier_id && product_id && staff_id && quantity && price)) {
            return res.status(400).send({ message: "필요한 정보를 모두 입력해주세요." });
        }

        const transaction = await models.sequelize.transaction();

        await DomesticPurchase.create({
            supplier_id,
            product_id,
            staff_id,
            quantity,
            price,
        }, {
            transaction
        });

        await transaction.commit();

        return res.status(201).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.updateByAdmin = async (req, res) => {
    try {
        const POSSIBLE_ATTRIBUTES = [
            "supplier_id",
            "product_id",
            "staff_id",
            "quantity",
            "price"
        ];
    
        let newData = {};
        POSSIBLE_ATTRIBUTES.map(
            (attribute) => (newData[attribute] = req.body[attribute])
        );

        const { domestic_purchase_id } = req.body;
        let prev = null;

        const transaction = await models.sequelize.transaction();

        if(newData.quantity) {
            prev = await DomesticPurchase.findOne({
                where: { id: domestic_purchase_id },
                attribute: ["id", "product_id", "quantity"]
            });
        }

        await DomesticPurchase.update(newData, {
            where: { id: domestic_purchase_id },
            productId: prev.dataValues.product_id,
            prevQuantity: prev.dataValues.quantity,
            individualHooks: true,
            transaction
        });

        await transaction.commit();

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};

exports.deleteByAdmin = async (req, res) => {
    try {
        const { domesticPurchaseId } = req.headers;

        await DomesticPurchase.destory({
            where: { id: domesticPurchaseId }
        });

        return res.status(200).send();
    }
    catch(err) {
        console.log(err);
        return res.status(400).send();
    }
};