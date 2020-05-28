"use strict";

const DomesticPurchase = require("../models").domestic_purchase;
const Product = require("../models").product;
const Staff = require("../models").staff;
const Supplier = require("../models").supplier;

/**
 * req.query.domestic_purchase_id
 */
exports.readByAdmin = async (req, res) => {
  let where = {};

  if (req.query.domestic_purchase_id) {
    try {
      const response = await DomesticPurchase.findOne({
        where: {
          id: req.query.domestic_purchase_id,
        }
      });
      const { product_id } = response.dataValues;
      where.product_id = product_id;
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
