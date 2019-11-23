const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

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
            include: [{
                model: Product,
                required: true
            }, {
                model: Account,
                required: true
            }],
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
        const { imp_uid } = req.query;
        const transaction = await models.sequelize.transaction();

        const order = await Order.findAll({
            where: { imp_uid },
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

module.exports = router;