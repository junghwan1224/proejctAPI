"use strict";

const Order = require("../models").order;
const Delivery = require("../models").delivery;
const Product = require("../models").product;
const models = require("../models");
const Account = require("../models").account;

// 유저의 모든 배송정보 조회
exports.readByUser = async (req, res) => {
  try {
    const { account_id } = req;
    const transaction = await models.sequelize.transaction();

    const delivery = await Delivery.findAll({
      where: { account_id },
      attributes: { exclude: ["createdAt", "updatedAt"] },
      transaction,
    });
    const deliveryInfo = delivery.map((d) => d.dataValues);

    if (!deliveryInfo.length) {
      return res.status(200).send();
    }

    const orderInfo = deliveryInfo.map((d) => {
      const { order_id } = d;
      return Order.findAll({
        where: { merchant_uid: order_id },
        attributes: [
          "merchant_uid",
          "amount",
          "quantity",
          "pay_method",
          "memo",
          "paidAt",
        ],
        include: [
          {
            model: Product,
            required: true,
          },
        ],
        transaction,
      });
    });
    const orderList = await Promise.all(orderInfo);

    await transaction.commit();

    // order와 delivery 정보 합침
    const result = orderList.map((order, idx) => {
      const delInfo = deliveryInfo[idx];

      const info = order.map((o) => {
        const { dataValues } = o;
        return {
          delivery: delInfo,
          order: dataValues,
        };
      });

      return info;
    });

    // order.paidAt(결제 날짜 최신 순)을 기준으로 정렬
    result.sort((a, b) => {
      if (a[0].order.paidAt > b[0].order.paidAt) {
        return -1;
      } else if (a[0].order.paidAt < b[0].order.paidAt) {
        return 1;
      }
      return 0;
    });

    res.status(200).send(result);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

// 모든 배송정보 리스트 조회
exports.readByAdmin = async (req, res) => {
  try {
    const transaction = await models.sequelize.transaction();

    const delivery = await Delivery.findAll({
      attributes: [
        "delivery_num",
        "order_id",
        "status",
        "location",
        "arrived_at",
        "createdAt",
      ],
      transaction,
    });
    const deliveryInfo = delivery.map((d) => d.dataValues);

    if (!deliveryInfo.length) {
      return res.status(200).send([]);
    }

    const orderInfo = deliveryInfo.map((d) => {
      const { order_id } = d;
      return Order.findAll({
        where: { merchant_uid: order_id },
        attributes: [
          "merchant_uid",
          "amount",
          "quantity",
          "pay_method",
          "memo",
          "paidAt",
          "mileage",
        ],
        include: [
          {
            model: Product,
            required: true,
          },
          {
            model: Account,
            required: true,
            attributes: ["id", "name"],
          },
        ],
        transaction,
      });
    });

    const orderList = await Promise.all(orderInfo);

    await transaction.commit();

    // order와 delivery 정보 합침
    const result = orderList.map((order, idx) => {
      const delInfo = deliveryInfo[idx];

      const info = order.map((o) => {
        const { dataValues } = o;
        return {
          delivery: delInfo,
          order: dataValues,
        };
      });

      return info;
    });

    // order.paidAt(결제 날짜 최신 순)을 기준으로 정렬
    result.sort((a, b) => {
      if (a[0].order.paidAt > b[0].order.paidAt) {
        return -1;
      } else if (a[0].order.paidAt < b[0].order.paidAt) {
        return 1;
      }
      return 0;
    });

    const deliveries = result.map((r) => {
      const { delivery, order } = r[0];

      let products = [];
      let amount = 0;
      for (const item of r) {
        products.push(item.order.product);
        amount += item.order.amount;
      }
      let obj = {};
      obj["account"] = { id: order.account.id, name: order.account.name };
      obj["driver"] = "추가 예정";
      obj["order_id"] = delivery.order_id;
      obj["delivery_number"] = delivery.delivery_num;
      obj["arriveAt"] = delivery.arrived_at;
      obj["status"] = delivery.status;
      obj["products"] = products;
      obj["paidAt"] = order.paidAt;
      obj["mileage"] = order.mileage;
      obj["amount"] = amount;

      return obj;
    });

    let filtered_deliveries = deliveries;
    if (req.query.account_id) {
      filtered_deliveries = deliveries.filter(
        (delivery) => delivery.account.id === req.query.account_id
      );
    }
    return res.status(200).send(filtered_deliveries);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
