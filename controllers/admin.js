"use strict";

const Admin = require("../models").admin;

exports.createByAdmin = async (req, res) => {
  /* If email, password, name, code are not included, return 400: */
  if (
    !(req.body.email && req.body.password && req.body.name && req.body.code)
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요."
    });
  }

  /* If the email number is already registered, raise 400: */
  try {
    const response = await Admin.findOne({
      where: { email: req.body.email }
    });
    if (response) {
      return res.status(400).send({ message: "이미 등록된 이메일입니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }

  /* Create admin, with level set to "NORMAL" : */
  try {
    await Admin.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      code: req.body.code
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
  /* Allow pre-defined attributes only:  */
  const ALLOWED_ATTRIBUTES = ["id", "email", "name", "code"];
  const fields = req.query.fields || "";

  /* If no admin_id was given, raise 400: */
  if (!req.query.admin_id) {
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });
  }
  console.log(req.query.admin_id);
  /* Fetch admin data including level attributes:  */
  try {
    const response = await Admin.findOne({
      where: { id: req.query.admin_id },
      attributes: ALLOWED_ATTRIBUTES
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
      return res.status(400).send({ message: "Admin data not found." });
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
  const POSSIBLE_ATTRIBUTES = ["email", "name", "code"];
  let newData = {};
  POSSIBLE_ATTRIBUTES.map(
    attribute => (newData[attribute] = req.body[attribute])
  );

  /* Verify whether the user exists: */
  try {
    const response = await Admin.findOne({
      where: {
        id: req.query.admin_id
      }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "해당 ID에 대한 Admin 데이터가 존재하지 않습니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }

  /* Return attributes based on the user request(parameters): */
  try {
    await Admin.update(newData, {
      where: {
        id: req.query.admin_id
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
  /* Send 400 if admin_id is not given: */
  try {
    if (!req.body.admin_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요."
      });
    }
    /* Verify whether the user exists: */
    const response = await Admin.findOne({
      where: { id: req.body.admin_id }
    });
    if (!response) {
      return res.status(400).send({ message: "User not found." });
    }

    /* Delete admin data from the DB: */
    await Admin.destroy({
      where: { id: req.body.admin_id },
      limit: 1
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
