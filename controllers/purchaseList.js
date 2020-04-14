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

        res.status(200).send(list);
    }
    catch(err) {
        res.status(400).send();
    }
};