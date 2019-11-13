const express = require("express");
const router = express.Router();
const asyncHandler = require('express-async-handler');
const verifyToken = require("./verifyToken");

const Delivery = require("../models").delivery;
const Order = require("../models").order;
const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const models = require("../models");

// 배송 조회
router.get("/get-all", verifyToken, asyncHandler(async (req, res) => {
    try {
        const { account_id } = req;
        const transaction = await models.sequelize.transaction();

        const delivery = await Delivery.findAll({
            where: { account_id },
            attributes: ["order_id", "status", "location", "arrived_at"],
            transaction
        });
        const deliveryInfo = delivery.map(d => d.dataValues);
        const result = deliveryInfo.map(d => {
            const { order_id } = d;
            return Order.findAll({
                where: { imp_uid: order_id },
                attributes: ["imp_uid", "amount", "quantity", "pay_method", "memo", "updatedAt"],
                include: [{
                    model: Product,
                    required: true,
                    include: [{
                        model: ProductAbstract,
                        required: true,
                        attributes: ["image", "maker", "maker_number", "type"]
                    }]
                }],
                transaction
            });
        });
        await Promise.all(result);

        await transaction.commit();

        res.status(200).send({ result, deliveryInfo });
    }

    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

router.get("/:order_id", asyncHandler(async (req, res) => {
    const { order_id } = req.params;
    const delivery = await Delivery.findOne({ where: order_id });

    res.status(200).send({ data:delivery.dataValues });
}));

// 배송 상태 업데이트
router.put("/update/status/:order_id", asyncHandler(async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    await Delivery.update(
        {
            status,
        },
        { where: order_id }
    );

    res.status(200).send({ message: "update success" });
}));

// 배송 위치 업데이트
router.put("/update/location/:order_id", asyncHandler(async (req, res) => {
    const { order_id } = req.params;
    const { location } = req.body;
   
    await Delivery.update(
        {
            location,
        },
        { where: order_id }
    );

    res.status(200).send({ message: "update success" });
}));

module.exports = router;