"use strict";

const Delivery = require("../models").delivery;
const Order = require("../models").order;
const Product = require("../models").product;
const models = require("../models");

// By user

// 특정 주문 상세정보
exports.readByUser = async (req, res) => {
  try {
    const { order_id } = req.query;
    const transaction = await models.sequelize.transaction();

    const delivery = await Delivery.findOne({
      where: { order_id },
      transaction
    });

    const orderInfo = await Order.findAll({
      where: { merchant_uid: order_id },
      include: [
        {
          model: Product,
          required: true
        }
      ],
      transaction
    });
    const orders = orderInfo.map(o => o.dataValues);

    await transaction.commit();

    res.status(201).send({ delivery, orders });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

// By Admin

// 상세 배송정보 조회
exports.readByAdmin = async (req, res) => {
  try {
    const { order_id } = req.query;
    const transaction = await models.sequelize.transaction();

    const delivery = await Delivery.findOne({
      where: { order_id },
      transaction
    });

    const orderInfo = await Order.findAll({
      where: { merchant_uid: order_id },
      include: [
        {
          model: Product,
          required: true
        }
      ],
      transaction
    });
    const orders = orderInfo.map(o => o.dataValues);

    await transaction.commit();
    res.status(201).send({ delivery, orders });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

// 배송 상태, 위치 동시 업데이트
exports.updateByAdmin = async (req, res) => {
  try {
    const { order_id } = req.body;
    const data = {};

    if (req.body["status"]) Object.assign(data, { status: req.body.status });

    if (req.body["location"])
      Object.assign(data, { location: req.body.location });

    await Delivery.update(data, {
      where: { order_id }
    });

    res.status(200).send();
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
