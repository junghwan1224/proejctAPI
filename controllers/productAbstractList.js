"use strict";

const ProductAbstract = require("../models").product_abstract;

exports.readByAdmin = async (req, res) => {
  try {
    const response = await ProductAbstract.findAll();
    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
