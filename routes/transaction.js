const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const sequelize = require("sequelize");

const { Op } = sequelize;
const models = require("../models");
const Account = require("../models").account;
const Order = require("../models").order;
const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;

// get transaction list
router.get("/ark/all", asyncHandler(async (req, res) => {
    try {
        const transaction = await models.sequelize.transaction();
        const orders = await Order.findAll({
            where: {
                [Op.not]: { status: "not paid" }
            },
            group: ["account_id", "merchant_uid", "name", "pay_method", "status", "createdAt", "updatedAt"],
            attributes: [
                "account_id", 
                "name", 
                "merchant_uid", 
                "pay_method", 
                "status", 
                "createdAt", 
                "updatedAt", 
                [sequelize.fn('sum', sequelize.col('quantity')), 'quantity'],
                [sequelize.fn('sum', sequelize.col('amount')), 'amount']
            ],
            transaction
        });

        await transaction.commit();

        res.status(201).send({ orders });
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 페이지를 새로고침 해주세요." });
    }
}));

router.get("/ark/detail", asyncHandler(async (req, res) => {
    try{
        const { merchant_uid } = req.query;
        const transaction = await models.sequelize.transaction();

        const order = await Order.findAll({
            where: { merchant_uid },
            include: [{
                model: Product,
                required: true,
                include: [{
                    model: ProductAbstract,
                    required: true,
                    attributes: ["image", "maker", "maker_number", "type"]
                }]
            },
            {
                model: Account,
                required: true,
                attributes: ["phone", "name", "crn", "mileage", "email"],
            }],
            transaction
        });

        await transaction.commit();

        res.status(201).send({ order });
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 페이지를 새로고침 해주세요." });
    }
}));

router.post("/ark/create", asyncHandler(async (req, res) => {
    try {}
    catch(err) {}
}));

router.put("/ark/status", asyncHandler(async (req, res) => {
    try {
        const { merchant_uid } = req.body;
    }
    catch(err) {}
}));

module.exports = router;