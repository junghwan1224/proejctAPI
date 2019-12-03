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
            order: [["createdAt", "DESC"]],
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

// get specific transaction detail by using merchant_uid
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

// create new transaction
router.post("/ark/create", asyncHandler(async (req, res) => {
    try {
        // 외상거래 내용 추가 시 재고처리도 바로??
        // order bulk create
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

// update transaction status
router.post("/ark/credit-complete", asyncHandler(async (req, res) => {
    try {
        const { merchant_uid } = req.body;

        await Order.update({
            status: "paid"
        }, {
            where: {
                merchant_uid
            }
        });

        res.status(201).send({ message: "결제처리가 완료되었습니다." });
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

// cancel deal with credit
router.post("/ark/cancel-credit", asyncHandler(async (req, res) => {
    try {
        // update status value paid or not paid to canceled
        // update stock
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

module.exports = router;