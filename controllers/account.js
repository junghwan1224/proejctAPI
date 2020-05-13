"use strict";

const bcrypt = require("bcryptjs");

const Account = require("../models").account;
const AccountLevel = require("../models").account_level;

exports.createByUser = async (req, res) => {
  /* If phone, password, name are not included, return 400: */
  if (!(req.body.phone && req.body.password && req.body.name)) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요.",
    });
  }

  /* If the phone number is already registered, raise 400: */
  try {
    const response = await Account.findOne({
      where: { phone: req.body.phone },
    });
    if (response) {
      return res.status(400).send({ message: "이미 등록된 전화번호입니다." });
    }
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }

  /* Create account, with level set to "UNCONFIRMED" : */
  try {
    await Account.create({
      phone: req.body.phone,
      password: req.body.password,
      name: req.body.name,
      crn: req.body.crn,
      email: req.body.email,
      level: "UNCONFIRMED",
    });
    return res.status(201).send();
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.readByUser = async (req, res) => {
  const fields = req.query.fields || "";
  const { account_id } = req;

  /* Fetch account data including level attributes:  */
  try {
    const response = await Account.findOne({
      where: { id: account_id },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: AccountLevel,
          required: true,
          as: "level_detail",
          attributes: ["discount_rate"],
        },
      ],
    });

    /* Return attributes based on the user request(parameters): */
    if (response) {
      const attributes = fields.toLowerCase().split(",");
      let data = {};
      if (fields.toLowerCase() != "all") {
        attributes.map(
          (attribute) => (data[attribute.trim()] = response[attribute.trim()])
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

// check exist account
exports.readByNonUser = async (req, res) => {
  try {
    const { phone } = req.query;

    let isValid = false;
    const account = await Account.findOne({
      where: { phone },
    });

    if (account) {
      isValid = true;
    }

    return res.status(200).send({ isValid });
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

exports.updateByUser = async (req, res) => {
  /* Allow pre-defined attributes only:  */
  const POSSIBLE_ATTRIBUTES = ["email", "crn", "name", "type", "password"];
  let newData = {};
  POSSIBLE_ATTRIBUTES.map(
    (attribute) => (newData[attribute] = req.body[attribute])
  );

  const { account_id } = req;

  /* Verify whether the user exists: */
  try {
    const response = await Account.findOne({
      where: {
        id: account_id,
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
    await Account.update(newData, {
      where: {
        id: account_id,
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

// reset password api
exports.updateByNonUser = async (req, res) => {
  try {
    const { phone, new_password } = req.body;
    const bcryptPwd = bcrypt.hashSync(new_password, 10);

    await Account.update(
      { password: bcryptPwd },
      {
        where: { phone },
      }
    );

    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};

/* Admin */

exports.readByAdmin = async (req, res) => {
  try {
    const account_id = req.query.account_id;
    const user = await Account.findOne({
      where: { id: account_id },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: AccountLevel,
          required: true,
          as: "level_detail",
          attributes: ["discount_rate"],
        },
      ],
    });

    return res.status(200).send(user);
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
};

exports.updateByAdmin = async (req, res) => {
  try {
    const account_id = req.body.account_id;
    if (!account_id)
      return res
        .status(400)
        .send({ message: "필요한 정보를 모두 입력해주세요." });
    const response = await Account.findOne({
      where: {
        id: account_id,
      },
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "해당 ID에 대한 유저 데이터가 존재하지 않습니다." });
    }

    /** Validate Level */
    if (req.body.level) {
      const response = await AccountLevel.findOne({
        where: {
          id: req.body.level,
        },
      });
      if (!response) {
        return res
          .status(400)
          .send({ message: "유효하지 않은 유저 등급입니다." });
      }
    }

    await Account.update(
      {
        email: req.body.email,
        crn: req.body.crn,
        name: req.body.name,
        type: req.body.type,
        mileage: req.body.mileage,
        level: req.body.level,
        password: req.body.password
          ? bcrypt.hashSync(req.body.password, 10)
          : undefined,
      },
      {
        where: {
          id: account_id,
        },
        individualHooks: true,
      }
    );

    return res.status(200).send();
  } catch (err) {
    console.log(err);
    res.status(400).send();
  }
};

exports.deleteByAdmin = async (req, res) => {
  /* Send 400 if account_id is not given: */
  try {
    const { account_id } = req.query;

    if (!account_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요.",
      });
    }
    /* Verify whether the user exists: */
    const response = await Account.findOne({
      where: { id: account_id },
    });
    if (!response) {
      return res.status(400).send({ message: "User not found." });
    }

    /* Delete account data from the DB: */
    await Account.destroy({
      where: { id: account_id },
      limit: 1,
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};