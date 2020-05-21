"use strict";

const DomesticPurchase = require("../models").domestic_purchase;
const Product = require("../models").product;
const Staff = require("../models").staff;

exports.readByAdmin = async (req, res) => {
  try {
    const response = await DomesticPurchase.findAll({
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
      ],
    });

    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};
