const express = require("express");
const router = express.Router();
const asyncHandler = require('express-async-handler');

const Delivery = require("../models").delivery;

// 배송 조회
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