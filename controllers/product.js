"use strict";

const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const Sequelize = require("sequelize");

const Op = Sequelize.Op;

const PRODUCT_ABSTRACT_ATTRIBUTES = [
  "image",
  "maker",
  "maker_number",
  "stock",
  "type",
  "id",
  "allow_discount"
];

const PRODUCT_ATTRIBUTES = [
  "price",
  "brand",
  "model",
  "oe_number",
  "start_year",
  "end_year",
  "engine",
  "description",
  "quality_cert",
  "id"
];
exports.createByAdmin = async (req, res) => {
  /* If necessary fields are not given, return 400: */
  if (
    !(
      req.body.abstract_id &&
      req.body.category &&
      req.body.brand &&
      req.body.model &&
      req.body.oe_number &&
      req.body.start_year &&
      req.body.end_year &&
      req.body.engine &&
      req.body.price
    )
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요."
    });
  }

  /* Set default values for selective fields: */
  req.body.description = req.body.description ? req.body.description : "";
  req.body.memo = req.body.memo ? req.body.memo : "";
  req.body.quality_cert = req.body.quality_cert ? req.body.quality_cert : "";
  req.body.is_public = req.body.is_public ? req.body.is_public : 1;

  /* Verify whether requested product_abstract_id is valid: */
  try {
    let response = await ProductAbstract.findOne({
      where: {
        id: req.body.abstract_id
      }
    });
    if (!response) {
      return res.status(400).send({
        message: "Invalid abstract_id."
      });
    }

    /* Append data to DB: */
    response = await Product.create({
      abstract_id: req.body.abstract_id,
      category: req.body.category,
      brand: req.body.brand,
      model: req.body.model,
      oe_number: req.body.oe_number,
      start_year: req.body.start_year,
      end_year: req.body.end_year,
      engine: req.body.engine,
      price: req.body.price,
      memo: req.body.memo,
      description: req.body.description,
      quality_cert: req.body.quality_cert,
      is_public: req.body.is_public
    });
    return res.status(201).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.readByUser = async (req, res) => {
  if (!req.query.product_id) {
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });
  }

  /* Fetch account data including level attributes:  */
  try {
    const response = await Product.findOne({
      where: {
        id: req.query.product_id
      },
      attributes: PRODUCT_ATTRIBUTES,
      include: [
        {
          model: ProductAbstract,
          required: true,
          as: "product_abstract",
          attributes: PRODUCT_ABSTRACT_ATTRIBUTES
        }
      ]
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 입니다." });
    }

    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.readByAdmin = async (req, res) => {
  if (!req.query.product_id) {
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });
  }

  /* Fetch account data including level attributes:  */
  try {
    const response = await Product.findOne({
      where: {
        id: req.query.product_id
      },
      include: [
        {
          model: ProductAbstract,
          required: true,
          as: "product_abstract"
        }
      ]
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 입니다." });
    }

    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.updateByAdmin = async (req, res) => {
  let response = {};
  try {
    response = await Product.findOne({
      where: {
        id: req.body.product_id
      }
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 값입니다." });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }

  /* Create product-abstract Promise: */
  let product_abstract_data = {};
  for (const attribute of PRODUCT_ABSTRACT_ATTRIBUTES) {
    product_abstract_data[attribute] = req.body[attribute];
  }
  const promise_product_abstract = ProductAbstract.update(
    product_abstract_data,
    {
      where: { id: response.abstract_id }
    }
  );

  /* Create product Promise: */
  let product_data = {};
  for (const attribute of PRODUCT_ATTRIBUTES) {
    product_data[attribute] = req.body[attribute];
  }
  const promise_product = Product.update(product_data, {
    where: { id: req.body.product_id }
  });

  /* Request a Promise */
  Promise.all([promise_product, promise_product_abstract])
    .then(() => {
      return res.status(200).send();
    })
    .catch(err => {
      return res.status(400).send({
        message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요."
      });
    });
};

exports.deleteByAdmin = async (req, res) => {
  /* Send 400 if account_id is not given: */
  try {
    if (!req.body.product_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요."
      });
    }
    /* Verify whether the user exists: */
    const response = await Product.findOne({
      where: { id: req.body.account_id }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id입니다." });
    }

    /* Delete account data from the DB: */
    await Product.destroy({
      where: { id: req.body.product_id },
      limit: 1
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
