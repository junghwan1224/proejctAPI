"use strict";

const { Op } = require("sequelize");

const DomesticPurchase = require("../models").domestic_purchase;
const Product = require("../models").product;
const Staff = require("../models").staff;
const Supplier = require("../models").supplier;

/**
 * req.query.singleProduct :: Boolean
 * req.query.recentLimit :: Integer
 * req.query.domestic_purchase_id
 */
exports.readByAdmin = async (req, res) => {
  let product_id;
  let createdAt;

  if (!req.query.domestic_purchase_id) {
    return res.status(400).send({ message: "필요한 정보가 누락되었습니다." });
  }

  let where = {};

  if (req.query.singleProduct) {
    try {
      const response = await DomesticPurchase.findOne({
        where: {
          id: req.query.domestic_purchase_id,
        },
        include: [
          {
            model: Product,
            required: true,
            attributes: ["id"],
          },
        ],
      });
      const { product, createdAt } = response.dataValues;
      where.product_id = product.id;
      if (req.query.recentLimit) where.createdAt = { [Op.lt]: createdAt };
    } catch (err) {
      console.log(err);
      return res.status(400).send();
    }
  }

  try {
    const response = await DomesticPurchase.findAll({
      where: where,
      include: [
        {
          model: Product,
          required: true,
          attributes: ["maker_number", "type", "maker"],
        },
        {
          model: Staff,
          required: true,
          attributes: ["id", "name", "department"],
        },
        { model: Supplier, required: true },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};
