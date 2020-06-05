"use strict";

const Supplier = require("../models").supplier;

exports.readByAdmin = async (req, res) => {
  try {
    const response = await Supplier.findAll();
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};
