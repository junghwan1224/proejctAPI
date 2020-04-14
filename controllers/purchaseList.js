"use strict";

const PurchaseList = require("../models/purchase_list").purchase_list;
const Product = require("../models").product;


exports.readByAdmin = async (req, res) => {
    try {
        const list = await PurchaseList.findAll({
            include: [{
                model: Product,
                required: true
            }],
        });

        return res.status(200).send(list);
    }
    catch(err) {
        res.status(400).send();
    }
};

exports.createByAdmin = async (req, res) => {
    try {
        const {
            parts_id,
            krw_price,
            foreign_price,
            foreign_currency,
            date,
            seller,
            state
        } = req.body;

        const partsId = parts_id ? parts_id : "annonymous";

        await PurchaseList.create({
            parts_id: partsId,
            krw_price,
            foreign_price,
            foreign_currency,
            date,
            seller,
            state
        });

        return res.status(201).send();
    }
    catch(err) {
        res.status(400).send();
    }
};

exports.updateByAdmin = async (req, res) => {
    try {
        const POSSIBLE_ATTRIBUTES = ["krw_price", "foreign_price", "foreign_currency", "seller", "state"];
        let newData = {};
        POSSIBLE_ATTRIBUTES.map(
            attribute => (newData[attribute] = req.body[attribute])
        );

        const { id } = req.body;

        await PurchaseList.update({}, {
            where: { id }
        });

        return res.status(200).send();
    }
    catch(err) {
        res.status(400).send();
    }
};