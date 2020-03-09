"use strict";

const axios = require("axios");

const Delivery = require("../models").delivery;
const Order = require("../models").order;
const Product = require("../models").product;
const models = require("../models");

const getToken = require("../public/js/getToken");

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

exports.readByNonUser = async (req, res) => {
  try {
    const { orderNum } = req.query;
    const merchant_uid = `MONTAR_${orderNum}`;
    // 결제 시각, 결제 금액, 주문 번호, 도착 예정, 현금 영수증

    const delivery = await Delivery.findOne({
      where: { order_id: merchant_uid }
    });

    const orderInfo = await Order.findAll({
      where: { merchant_uid },
      include: [
        {
          model: Product,
          required: true
        }
      ]
    });
    const orders = orderInfo.map(o => o.dataValues);

    if(orders.length) {
      const token = await getToken();

      const getPayment = await axios({
        url: `https://api.iamport.kr/payments/${orders[0].imp_uid}`,
        method: "get",
        headers: { Authorization: token }
      });

      return res
        .status(200)
        .send({ delivery, orders, payment: getPayment.data.response });
    }
    else {
      return res.status(200).send({ warning: "주문번호와 일치하는 주문내역이 없습니다. 입력하신 주문번호를 다시 확인해주세요." });
    }
    
  } catch (err) {
    console.log(err);
    res.status(400).send();
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
