"use strict";

const AccountLevel = require("../models").account_level;

exports.createByAdmin = async (req, res) => {
  /* If discount_rate is not included, return 400: */
  if (!req.body.discount_rate) {
    return res.status(400).send({
      message: "No sufficient data."
    });
  }

  /* Verify whether the ID already exists: */
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

  /* Create AccountLevel data: */
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

exports.readByUser = async (req, res) => {
  /* Read AccountLevel data: */
  const level_id = req.query.level_id;

  try {
    const response = await AccountLevel.findOne({
      where: {
        id: level_id,
        attributes: ["discount_rate"]
      }
    });
    return res.status(200).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
