"use strict";

const ProductAbstract = require("../models").product_abstract;

exports.createByAdmin = async (req, res) => {
  /* If phone, password, name, type are not included, return 400: */
  if (
    !(
      req.body.maker &&
      req.body.maker_number &&
      req.body.image &&
      req.body.stock &&
      req.body.type
    )
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요."
    });
  }

  req.body.allow_discount = req.body.allow_discount
    ? req.body.allow_discount
    : true;

  /* Append data to DB: */
  try {
    const response = await ProductAbstract.create({
      maker: req.body.maker,
      maker_number: req.body.maker_number,
      image: req.body.image,
      stock: req.body.stock,
      type: req.body.type,
      allow_discount: req.body.allow_discount
    });
    return res.status(201).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.readByAdmin = async (req, res) => {
  /* If product_abstract_id is not given, raise 400: */
  if (!req.query.product_abstract_id) {
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });
  }

  try {
    const response = await ProductAbstract.findOne({
      where: {
        id: req.query.product_abstract_id
      }
    });
    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.updateByAdmin = async (req, res) => {
  /* If product_abstract_id is not given, raise 400: */
  if (!req.body.product_abstract_id) {
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });
  }

  /* Filter out invalid attributes : */
  const POSSIBLE_ATTRIBUTES = [
    "image",
    "maker",
    "maker_number",
    "stock",
    "type",
    "allow_discount"
  ];
  let newData = {};
  POSSIBLE_ATTRIBUTES.map(
    attribute => (newData[attribute] = req.body[attribute])
  );

  try {
    /* Verfiy product abstract ID: */
    const response = await ProductAbstract.findOne({
      where: {
        id: req.body.product_abstract_id
      }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "ProductAbstract not found by the given ID." });
    }

    /* Update information based on the user parameters: */
    await ProductAbstract.update(newData, {
      where: {
        id: req.body.product_abstract_id
      }
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.deleteByAdmin = async (req, res) => {
  /* If product_abstract_id is not given, raise 400: */
  if (!req.body.product_abstract_id) {
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });
  }

  try {
    /* Verfiy product abstract ID: */
    const response = await ProductAbstract.findOne({
      where: {
        id: req.body.product_abstract_id
      }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "ProductAbstract not found by the given ID." });
    }

    /* Destroy ProductAbstract: */
    await ProductAbstract.destroy({
      where: {
        id: req.body.product_abstract_id
      },
      limit: 1
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
