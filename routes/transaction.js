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

// update transaction status
router.post("/ark/complete-credit", asyncHandler(async (req, res) => {
    try {
        const { merchant_uid } = req.body;

        await Order.update({
            status: "credit"
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
        const { merchant_uid } = req.body;
        const transaction = await models.sequelize.transaction();

        // stock update
        const orders = await Order.findAll({
            where: { merchant_uid },
            transaction
        });
        const productsId = orders.map(o => o.dataValues.product_id);
        const productsQuantity = orders.map(o => o.dataValues.quantity);

        const prodArr = productsId.map((p, idx) => ({
            "id": p,
            "quantity": productsQuantity[idx]
        }));
        prodArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });

        const abstractsIds = await Product.findAll({
            where: { id: { [Op.in]: prodArr.map(e => e.id) } },
            include: [ProductAbstract],
            transaction
        });

        const abstArr = abstractsIds.map(
            product => {
                const { dataValues } = product;
                const { product_abstract } = dataValues;
                const prop = product_abstract.dataValues;
    
                return prop.id;
            }
        );

        const abstObj = abstArr.map((abst, idx) => ({
            "id": abst,
            "quantity": prodArr[idx].quantity
        }));
    
        const abstractMap = abstObj.reduce((prev, cur) => {
            let count = prev.get(cur.id) || 0;
            prev.set(cur.id, cur.quantity + count);
            return prev;
        }, new Map());
    
        const mapToArr = [...abstractMap].map( ([id, quantity]) => { return {id, quantity} });
        mapToArr.sort((a, b) => { if(a.id < b.id) return -1; else return 1; });
    
        const abstracts = await ProductAbstract.findAll({
            where: {
                id: { [Op.in]: abstObj.map(e => e.id) }
            },
            transaction
        });
    
        const updatedProducts = abstracts.map(
            product => {
                return product.dataValues;
            }
        );
    
        updatedProducts.forEach(
         (product, idx) => {
             product.stock += mapToArr[idx].quantity;
         }
        );
    
        await ProductAbstract.bulkCreate(updatedProducts, {
            updateOnDuplicate: ["stock"],
            transaction
        });

        await Order.update({
            status: "cancelled"
        }, {
            where: { merchant_uid },
            transaction
        });

        await transaction.commit();

        res.status(201).send({ message: "결제 취소가 완료되었습니다." });
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

router.delete("/ark/credit", asyncHandler(async (req, res) => {
    try {
        const { merchant_uid } = req.body;

        await Order.destroy({
            where: { merchant_uid }
        });

        res.sendStatus(200);
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

module.exports = router;