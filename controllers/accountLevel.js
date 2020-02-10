"use strict";

const AccountLevel = require("../models").account_level;

exports.createByAdmin = async (req, res) => {
  if (!req.body.discount_rate) {
    return res.status(400).send({
      message: "No sufficient data."
    });
  }

  try {
    const response = await AccountLevel.findOne({
      where: { id: req.body.id }
    });
    if (response) {
      return res
        .status(400)
        .send({ message: "Duplicated ID `" + req.body.id + "`." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }

  try {
    await AccountLevel.create({
      id: req.body.id,
      discount_rate: req.body.discount_rate
    });
    return res.status(201).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.readByAdmin = async (req, res) => {
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
