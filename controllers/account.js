"use strict";

const Account = require("../models").account;
const AccountLevel = require("../models").account_level;

exports.createByUser = async (req, res) => {
  if (
    !(req.body.phone && req.body.password && req.body.name && req.body.type)
  ) {
    return res.status(400).send({
      message: "No sufficient data."
    });
  }

  try {
    await Account.create({
      phone: req.body.phone,
      password: req.body.password,
      name: req.body.name,
      crn: req.body.crn,
      type: req.body.type,
      email: req.body.email,
      level: "NORMAL"
    });

    return res.status(201).send();
  } catch (error) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.readByUser = async (req, res) => {
  const ALLOWED_ATTRIBUTES = [
    "id",
    "phone",
    "name",
    "email",
    "crn",
    "type",
    "mileage",
    "level"
  ];
  const fields = req.query.fields || "";
  const account_id = req.query.account_id;

  const response = await Account.findOne({
    where: { id: account_id },
    attributes: ALLOWED_ATTRIBUTES,
    include: [
      {
        model: AccountLevel,
        required: true,
        as: "level_detail",
        attributes: ["discount_rate"]
      }
    ]
  });

  try {
    if (response) {
      const attributes = fields.toLowerCase().split(",");
      let data = {};
      if (fields.toLowerCase() != "all") {
        attributes.map(
          attribute => (data[attribute.trim()] = response[attribute.trim()])
        );
      } else {
        data = response;
      }
      return res.status(200).send(data);
    } else {
      return res.status(400).send({ message: "User data not found." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.updateByUser = async (req, res) => {
  const POSSIBLE_ATTRIBUTES = ["email", "crn", "name", "type", "password"];

  let newData = {};
  POSSIBLE_ATTRIBUTES.map(
    attribute => (newData[attribute] = req.body[attribute])
  );
  try {
    await Account.update(newData, {
      where: {
        id: req.query.account_id
      }
    });
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.deleteByAdmin = async (req, res) => {
  try {
    await Account.destroy({
      where: { id: req.query.account_id },
      limit: 1
    });
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
