"use strict";

const Product = require("../models").product;
const Account = require("../models").account;
const AccountLevel = require("../models").account_level;
const Sequelize = require("sequelize");
const { verifyToken } = require("../routes/verifyToken");

const Op = Sequelize.Op;
const calculateDiscount = require("./common/discount").calculateDiscount;

exports.createByAdmin = async (req, res) => {
  /* If necessary fields are not given, return 400: */
  if (
    !(
      req.body.maker &&
      req.body.maker_number &&
      req.body.maker_origin &&
      req.body.models &&
      req.body.type &&
      req.body.oe_number &&
      req.body.stock &&
      req.body.price
    )
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요.",
    });
  }

  /* Validate models: */
  try {
    const rows = req.body.models.split("\n");
    for (const row of rows) {
      /* brand$$model$$start_year$$end_year$$engine */
      const item = row.split("$$");
      parseInt(item[2]) + parseInt(item[3]); // INT TEST
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "잘못된 형식의 models입니다." });
  }

  /* Set default values for selective fields: */
  req.body.images = req.body.images ? req.body.images : "";
  req.body.description_images = req.body.description_images
    ? req.body.description_images
    : "";
  req.body.attributes = req.body.attributes ? req.body.attributes : "";
  req.body.is_public = req.body.is_public ? req.body.is_public : 1;
  req.body.memo = req.body.memo ? req.body.memo : "";
  req.body.tags = req.body.tags ? req.body.tags : "";
  req.body.quality_cert = req.body.quality_cert ? req.body.quality_cert : "";
  req.body.allow_discount = req.body.allow_discount
    ? req.body.allow_discount
    : 1;

  /* Append data to DB: */
  try {
    const response = await Product.create({ ...req.body });
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

  /* Check if user is logged in, and fetch USER_DISCOUNT: */
  let USER_DISCOUNT = undefined;
  const { authorization } = req.headers;
  const accountId = authorization
    ? await verifyToken(authorization, "user")
    : null;
  if (accountId) {
    const account = await Account.findOne({
      where: {
        id: accountId,
      },
      include: [
        {
          model: AccountLevel,
          required: true,
          as: "level_detail",
          attributes: ["discount_rate"],
        },
      ],
    });
    USER_DISCOUNT = parseFloat(account.level_detail.discount_rate);
  }

  /* Fetch account data including level attributes:  */
  try {
    const response = await Product.findOne({
      where: {
        id: req.query.product_id,
        is_public: true,
      },
      attributes: { exclude: ["createdAt", "updatedAt", "is_public", "stock"] },
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 입니다." });
    }

    const product = response.dataValues;
    const calculated = calculateDiscount(
      USER_DISCOUNT,
      product.price,
      product.allow_discount
    );
    product.price = calculated.price;
    product.originalPrice = calculated.originalPrice;
    product.discountRate = calculated.discountRate;

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
        id: req.query.product_id,
      },
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
  /** Raise 400 if no product_id was given: */
  if (!req.body.product_id)
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });

  try {
    if (!Product.findOne({ where: { id: req.body.product_id } }))
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 값입니다." });

    /* Prevent from forgery: */
    delete req.body["id"];
    delete req.body["updatedAt"];
    delete req.body["createdAt"];

    await Product.update(
      { ...req.body },
      {
        where: { id: req.body.product_id },
        limit: 1,
      }
    );
    return res.status(200).send();
  } catch (err) {
    console.log(err);
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
        message: "필요한 정보를 모두 입력해주세요.",
      });
    }
    /* Verify whether the product exists: */
    const response = await Product.findOne({
      where: { id: req.query.product_id },
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id입니다." });
    }

    /* Delete account product from the DB: */
    await Product.destroy({
      where: { id: req.query.product_id },
      limit: 1,
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};