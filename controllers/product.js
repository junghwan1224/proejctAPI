"use strict";

const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const Sequelize = require("sequelize");

const Op = Sequelize.Op;

exports.createByAdmin = async (req, res) => {
  /* If necessary fields are not given, return 400: */
  if (
    !(
      req.body.maker &
      req.body.maker_number &
      req.body.maker_origin &
      req.body.type &
      req.body.classification &
      req.body.brand &
      req.body.model &
      req.body.oe_number &
      req.body.start_year &
      req.body.end_year &
      req.body.stock &
      req.body.price
    )
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요."
    });
  }

  /* Set default values for selective fields: */
  req.body.images ? req.body.images : "";
  req.body.description_images ? req.body.description_images : "";
  req.body.attributes ? req.body.attributes : "";
  req.body.is_public ? req.body.is_public : 1;
  req.body.memo ? req.body.memo : "";
  req.body.quality_cert ? req.body.quality_cert : "";
  req.body.engine ? req.body.engine : "";
  req.body.allow_discount ? req.body.allow_discount : 1;

  /* Append data to DB: */
  try {
    response = await Product.create({ ...req.body });
    return res.status(201).send(response);
  } catch (err) {
    console.log(err);
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
        id: req.query.product_id,
        is_public: true
      },
      attributes: USER_PRODUCT_ATTRIBUTES,
      attributes: { exclude: ["createdAt", "updatedAt", "is_public", "stock"] }
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 입니다." });
    }
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
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
      }
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 입니다." });
    }

    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
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
  /* Send 400 if product_id is not given: */
  try {
    if (!req.query.product_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요."
      });
    }
    /* Verify whether the user exists: */
    const response = await Product.findOne({
      where: { id: req.query.product_id }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id입니다." });
    }

    /* Prevent Forgery: */
    delete req.body["updatedAt"];
    delete req.body["createdAt"];

    /* Delete account data from the DB: */
    await Product.update(
      { ...req.body },
      {
        where: { id: req.query.product_id },
        limit: 1
      }
    );
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.deleteByAdmin = async (req, res) => {
  /* Send 400 if product_id is not given: */
  try {
    if (!req.query.product_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요."
      });
    }
    /* Verify whether the product exists: */
    const response = await Product.findOne({
      where: { id: req.query.product_id }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id입니다." });
    }

    /* Delete account product from the DB: */
    await Product.destroy({
      where: { id: req.query.product_id },
      limit: 1
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
