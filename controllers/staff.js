"use strict";

const bcrypt = require("bcryptjs");
const Staff = require("../models").staff;

exports.createByAdmin = async (req, res) => {
  /* If phone, password, name are not included, return 400: */
  if (
    !(
      req.body.email &&
      req.body.password &&
      req.body.name &&
      req.body.phone &&
      req.body.department &&
      req.body.rank
    )
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요.",
    });
  }

  /* If the email is already registered, raise 400: */
  try {
    const response = await Staff.findOne({
      where: { email: req.body.email },
    });
    if (response) {
      return res.status(400).send({ message: "이미 등록된 이메일입니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }

  /* Create account, with level set to "UNCONFIRMED" : */
  try {
    await Staff.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      phone: req.body.phone,
      department: req.body.department,
      rank: req.body.rank,
      permission: req.body.permission,
    });
    return res.status(201).send();
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.readByAdmin = async (req, res) => {
  try {
    const response = await Staff.findOne({
      where: { id: req.query.staff_id },
      attributes: {
        exclude: ["password"],
      },
    });

    if (response) {
      return res.status(200).send(response);
    } else {
      return res.status(400).send({ message: "해당 유저를 찾을 수 없습니다." });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.updateByAdmin = async (req, res) => {
  /* Allow pre-defined attributes only:  */
  const POSSIBLE_ATTRIBUTES = [
    "email",
    "name",
    "phone",
    "password",
    "department",
    "rank",
    "permission",
  ];

  let newData = {};
  POSSIBLE_ATTRIBUTES.map(
    (attribute) => (newData[attribute] = req.body[attribute])
  );

  // Encrypt password
  if (newData.password) {
    newData.password = bcrypt.hashSync(newData.password, 10);
  }

  if (!req.body.staff_id)
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });

  /* Verify whether the staff exists: */
  try {
    const response = await Staff.findOne({
      where: {
        id: req.body.staff_id,
      },
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
    await Staff.update(newData, {
      where: {
        id: req.body.staff_id,
      },
      individualHooks: true,
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
    const { staff_id } = req.query;

    if (!staff_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요.",
      });
    }
    /* Verify whether the user exists: */
    const response = await Staff.findOne({
      where: { id: staff_id },
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "해당 유저를 발견하지 못했습니다." });
    }

    /* Delete account data from the DB: */
    await Staff.destroy({
      where: { id: staff_id },
      limit: 1,
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
