"use strict";

const Account = require("../models").account;
const AccountLevel = require("../models").account_level;

exports.createByUser = async (req, res) => {
  /* If phone, password, name, type are not included, return 400: */
  if (
    !(req.body.phone && req.body.password && req.body.name && req.body.type)
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요."
    });
  }

  /* If the phone number is already registered, raise 400: */
  try {
    const response = await Account.findOne({
      where: { phone: req.body.phone }
    });
    if (response) {
      return res.status(400).send({ message: "이미 등록된 전화번호입니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }

  /* Create account, with level set to "NORMAL" : */
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
  /* Allow pre-defined attributes only:  */
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

  /* Fetch account data including level attributes:  */
  try {
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

    /* Return attributes based on the user request(parameters): */
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
  /* Allow pre-defined attributes only:  */
  const POSSIBLE_ATTRIBUTES = ["email", "crn", "name", "type", "password"];
  let newData = {};
  POSSIBLE_ATTRIBUTES.map(
    attribute => (newData[attribute] = req.body[attribute])
  );

  /* Verify whether the user exists: */
  try {
    const response = await Account.findOne({
      where: {
        iid: req.query.account_id
      }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "해당 ID에 대한 유저 데이터가 존재하지 않습니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }

  /* Return attributes based on the user request(parameters): */
  try {
    await Account.update(newData, {
      where: {
        id: req.query.account_id
      }
    });
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.deleteByAdmin = async (req, res) => {
  /* Send 400 if account_id is not given: */
  try {
    if (!req.body.account_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요."
      });
    }
    /* Verify whether the user exists: */
    const response = await Account.findOne({
      where: { id: req.body.account_id }
    });
    if (!response) {
      return res.status(400).send({ message: "User not found." });
    }

    /* Delete account data from the DB: */
    await Account.destroy({
      where: { id: req.body.account_id },
      limit: 1
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
