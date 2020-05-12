"use strict";

const Order = require("../models").order;
const Sequelize = require("sequelize");

exports.readByAdmin = async (req, res) => {
  /** Raise 400 for product_id is not given: */
  if (!req.query.product_id && !req.query.account_id)
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });

  let where = {};
  if (req.query.product_id) where["product_id"] = req.query.product_id;
  if (req.query.account_id) where["account_id"] = req.query.account_id;

  /* Fetch products and apply discount_rate: */
  try {
    const response = await Order.findAll({
      where: where,
      order: ["createdAt"],
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};
