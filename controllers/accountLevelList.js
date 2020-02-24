"use strict";

const AccountLevel = require("../models").account_level;

exports.readByAdmin = async (req, res) => {
  /* Read AccountLevel data: */
  try {
    const response = await AccountLevel.findAll({
      attributes: ["id", "discount_rate"]
    });
    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
