"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models").admin;
const Account = require("../models").account;

const JWT_SECRET = process.env.JWT_SECRET;

exports.loginByUser = async (req, res) => {
  const { phone, password } = req.body;

  if (phone === undefined || phone === null || phone.length === 0) {
    return res.status(400).send({ message: "연락처를 입력해주세요." });
  }
  if (password === undefined || password === null || password.length === 0) {
    return res.status(400).send({ message: "비밀번호를 입력해주세요." });
  }

  try {
    const account = await Account.findOne({
      where: {
        phone,
      },
    });

    if (account) {
      const { id, name, level } = account.dataValues;
      if (bcrypt.compareSync(password, account.dataValues.password)) {
        // create JWT and send data.
        let token = jwt.sign({ id }, JWT_SECRET, {
          expiresIn: "15 days",
        });

        res.cookie("user", token);
        return res.status(200).send({
          id,
          name,
          phone,
          level,
          token,
        });
      } else {
        return res
          .status(400)
          .send({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }
    } else {
      return res.status(400).send({ message: "가입되지 않은 전화번호입니다." });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요.",
    });
  }
};

exports.loginByAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (email === undefined || email === null || email.length === 0) {
    return res.status(400).send({ message: "연락처를 입력해주세요." });
  }

  if (password === undefined || password === null || password.length === 0) {
    return res.status(400).send({ message: "비밀번호를 입력해주세요." });
  }

  try {
    const admin = await Admin.findOne({
      where: {
        email,
      },
    });

    if (admin) {
      const { id, name, code } = admin.dataValues;
      if (bcrypt.compareSync(password, admin.dataValues.password)) {
        // create JWT and send data.
        let token = jwt.sign({ id }, JWT_SECRET, {
          expiresIn: "15 days",
        });

        res.cookie("user", token);
        res.status(200).send({
          id,
          name,
          email,
          code,
          token,
        });
      } else {
        return res
          .status(400)
          .send({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }
    } else {
      res.status(400).send({
        message: "가입되지 않은 이메일 주소입니다.",
      });
    }
  } catch (err) {
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};
