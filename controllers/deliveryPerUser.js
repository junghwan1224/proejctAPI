"use strict";

const Delivery = require("../models").delivery;
const Order = require("../models").order;
const Product = require("../models").product;
const models = require("../models");

// 특정 유저의 배송정보 조회
exports.readByAdmin = async (req, res) => {
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
        attributes: [
          "merchant_uid",
          "amount",
          "quantity",
          "pay_method",
          "memo",
          "updatedAt"
        ],
        include: [
          {
            model: Product,
            required: true
          }
        ],
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
          order: dataValues
        };
      });

      return info;
    });

    // order.updatedAt(결제 날짜 최신 순)을 기준으로 정렬
    result.sort((a, b) => {
      if (a[0].order.updatedAt > b[0].order.updatedAt) {
        return -1;
      } else if (a[0].order.updatedAt < b[0].order.updatedAt) {
        return 1;
      }
      return 0;
    });

    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
