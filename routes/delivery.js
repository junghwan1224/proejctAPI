const express = require("express");
const router = express.Router();
const asyncHandler = require('express-async-handler');
const verifyToken = require("./verifyToken");

const Account = require("../models").account;
const Delivery = require("../models").delivery;
const Order = require("../models").order;
const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const models = require("../models");

// 배송 조회
router.get("/all", verifyToken, asyncHandler(async (req, res) => {
    try {
        const { account_id } = req;
        const transaction = await models.sequelize.transaction();

        const delivery = await Delivery.findAll({
            where: { account_id },
            attributes: ["order_id", "status", "location", "arrived_at"],
            transaction
        });
        const deliveryInfo = delivery.map(d => d.dataValues);

        if(! deliveryInfo.length) {
            return res.status(200).send({ message: "주문 내역이 없습니다.", result: [] });
        }

        const orderInfo = deliveryInfo.map(d => {
            const { order_id } = d;
            return Order.findAll({
                where: { merchant_uid: order_id },
                attributes: ["merchant_uid", "amount", "quantity", "pay_method", "memo", "updatedAt"],
                include: [{
                    model: Product,
                    required: true,
                    include: [{
                        model: ProductAbstract,
                        required: true,
                        as: "product_abstract",
                        attributes: ["image", "maker", "maker_number", "type"]
                    }]
                }],
                transaction
            });
        });
        const orderList = await Promise.all(orderInfo);

        await transaction.commit();

        // order와 delivery 정보 합침
        const result = orderList.map((order, idx) => {
            const delInfo = deliveryInfo[idx];

            const info = order.map(o => {
                const { dataValues } = o;
                return {
                    delivery: delInfo,
                    order: dataValues,
                };
            });

            return info;
        });

        // order.updatedAt(결제 날짜 최신 순)을 기준으로 정렬
        result.sort((a, b) => {
            if(a[0].order.updatedAt > b[0].order.updatedAt) { return -1; }
            else if(a[0].order.updatedAt < b[0].order.updatedAt) { return 1; }
            return 0;
        });

        res.status(200).send({ result });
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
router.put("/status/:order_id", asyncHandler(async (req, res) => {
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
router.put("/location/:order_id", asyncHandler(async (req, res) => {
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


/************ Ark ************/

router.get("/ark/list", asyncHandler(async (req, res) => {
    try {
        const transaction = await models.sequelize.transaction();

        const delivery = await Delivery.findAll({
            attributes: ["delivery_num", "order_id", "status", "location", "arrived_at", "createdAt"],
            transaction
        });
        const deliveryInfo = delivery.map(d => d.dataValues);

        if(! deliveryInfo.length) {
            return res.status(200).send({ message: "주문 내역이 없습니다.", result: [] });
        }

        const orderInfo = deliveryInfo.map(d => {
            const { order_id } = d;
            return Order.findAll({
                where: { merchant_uid: order_id },
                attributes: ["merchant_uid", "amount", "quantity", "pay_method", "memo", "updatedAt"],
                include: [{
                    model: Product,
                    required: true,
                    include: [{
                        model: ProductAbstract,
                        required: true,
                        as: "product_abstract",
                        attributes: ["image", "maker", "maker_number", "type"]
                    }]
                },
                {
                    model: Account,
                    required: true,
                    attributes: ["id", "phone", "name", "crn", "mileage", "email"],
                }],
                transaction
            });
        });
        
        const orderList = await Promise.all(orderInfo);

        await transaction.commit();
        
        // order와 delivery 정보 합침
        const result = orderList.map((order, idx) => {
            const delInfo = deliveryInfo[idx];

            const info = order.map(o => {
                const { dataValues } = o;
                return {
                    delivery: delInfo,
                    order: dataValues,
                };
            });

            return info;
        });

        // order.updatedAt(결제 날짜 최신 순)을 기준으로 정렬
        result.sort((a, b) => {
            if(a[0].order.updatedAt > b[0].order.updatedAt) { return -1; }
            else if(a[0].order.updatedAt < b[0].order.updatedAt) { return 1; }
            return 0;
        });

        const deliveries = result.map(r => {
            const { delivery, order } = r[0];
            let obj = {};
            obj["account"] = { "id": order.account.id, "name": order.account.name };
            obj["driver"] = "추가 예정";
            obj["order_id"] = delivery.order_id;
            obj["delivery_number"] = delivery.delivery_num;
            obj["arriveAt"] = delivery.arrived_at;
            obj["status"] = delivery.status;

            return obj;
        });

        res.status(200).send({ deliveries });
    }

    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

router.get("/ark/detail", asyncHandler(async (req, res) => {
    try {
        const { order_id } = req.query;
        const transaction = await models.sequelize.transaction();

        const delivery = await Delivery.findOne({
            where: { order_id },
            transaction
        });

        const orderInfo = await Order.findAll({
            where: { merchant_uid: order_id },
            include: [{
                model: Product,
                required: true,
                include: [{
                    model: ProductAbstract,
                    required: true,
                    as: "product_abstract",
                    attributes: ["image", "maker", "maker_number", "type"]
                }]
            }],
            transaction
        });
        const orders = orderInfo.map(o => o.dataValues);

        await transaction.commit();
        res.status(201).send({ delivery, orders });
    }
    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

router.get("/ark/user", asyncHandler(async (req, res) => {
    try {
        const { account_id } = req.query;
        const transaction = await models.sequelize.transaction();

        const delivery = await Delivery.findAll({
            where: { account_id },
            attributes: ["order_id", "status", "location", "arrived_at"],
            transaction
        });
        const deliveryInfo = delivery.map(d => d.dataValues);
        const orderInfo = deliveryInfo.map(d => {
            const { order_id } = d;
            return Order.findAll({
                where: { merchant_uid: order_id },
                attributes: ["merchant_uid", "amount", "quantity", "pay_method", "memo", "updatedAt"],
                include: [{
                    model: Product,
                    required: true,
                    include: [{
                        model: ProductAbstract,
                        required: true,
                        as: "product_abstract",
                        attributes: ["image", "maker", "maker_number", "type"]
                    }]
                }],
                transaction
            });
        });
        
        const orderList = await Promise.all(orderInfo);

        await transaction.commit();
        
        // order와 delivery 정보 합침
        const result = orderList.map((order, idx) => {
            const delInfo = deliveryInfo[idx];

            const info = order.map(o => {
                const { dataValues } = o;
                return {
                    delivery: delInfo,
                    order: dataValues,
                };
            });

            return info;
        });

        // order.updatedAt(결제 날짜 최신 순)을 기준으로 정렬
        result.sort((a, b) => {
            if(a[0].order.updatedAt > b[0].order.updatedAt) { return -1; }
            else if(a[0].order.updatedAt < b[0].order.updatedAt) { return 1; }
            return 0;
        });

        res.status(200).send({ result });
    }

    catch(err) {
        console.log(err);
        res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

module.exports = router;