"use strict";

const DomesticPurchase = require("../models").domestic_purchase;
const PurchaseMapper = require("../models").purchase_mapper;
const models = require("../models");
const Product = require("../models").product;
const Staff = require("../models").staff;
const Supplier = require("../models").supplier;

exports.readByAdmin = async (req, res) => {
  try {
    const { domestic_purchase_id } = req.query;

    const response = await DomesticPurchase.findOne({
      where: {
        id: domestic_purchase_id,
      },
      include: [
        {
          model: Product,
          required: true,
        },
        {
          model: Staff,
          required: true,
        },
        {
          model: Supplier,
          required: true,
        },
      ],
    });

    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

exports.createByAdmin = async (req, res) => {
  try {
    const {
      supplier_id,
      date,
      verified,
      memo,
      products
    } = req.body;

    const transaction = await models.sequelize.transaction();
    const { staff_id } = req;

    const newPurchase = await PurchaseMapper.create({
      supplier_id,
      staff_id,
      date,
      verified,
      memo 
    });
    const { id: mapper_id } = newPurchase.dataValues;

    const addProductToDomesticPurchase = products.map(product => {
      const { product_id, quantity, price } = product;
      return DomesticPurchase.create({
        mapper_id, product_id, quantity, price
      });
    });
    await Promise.all(addProductToDomesticPurchase);

    await transaction.commit();

    return res.status(201).send(newPurchase);
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

exports.updateByAdmin = async (req, res) => {
  try {
    const POSSIBLE_ATTRIBUTES = [
      "supplier_id",
      "product_id",
      "staff_id",
      "quantity",
      "price",
    ];

    let newData = {};
    POSSIBLE_ATTRIBUTES.map(
      (attribute) => (newData[attribute] = req.body[attribute])
    );

    const { domestic_purchase_id } = req.body;
    let prev = null;

    const transaction = await models.sequelize.transaction();

    if (newData.quantity || newData.product_id) {
      prev = await DomesticPurchase.findOne({
        where: { id: domestic_purchase_id },
        attribute: ["id", "product_id", "quantity"],
        transaction,
      });
    }

    await DomesticPurchase.update(newData, {
      where: { id: domestic_purchase_id },
      productId: prev ? prev.dataValues.product_id : null,
      prevQuantity: prev ? prev.dataValues.quantity : null,
      individualHooks: true,
      transaction,
    });

    await transaction.commit();

    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

exports.deleteByAdmin = async (req, res) => {
  try {
    const { domesticPurchaseId } = req.headers;

    await DomesticPurchase.destory({
      where: { id: domesticPurchaseId },
    });

    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};
