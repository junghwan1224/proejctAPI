"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models").admin;
const Account = require("../models").account;

const DEV_SECRET = process.env.DEV_SECRET;

exports.loginByUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (phone === undefined || phone === null || phone.length === 0) {
      return res.status(400).send({ message: "연락처를 입력해주세요." });
    }

    if (password === undefined || password === null || password.length === 0) {
      return res.status(400).send({ message: "비밀번호를 입력해주세요." });
    }

    const account = await Account.findOne({
      where: {
        phone
      }
    });

    if (account) {
      const { id, name, type } = account.dataValues;
      if (bcrypt.compareSync(password, account.dataValues.password)) {
        // create JWT and send data.
        let token = jwt.sign({ id }, DEV_SECRET, {
          expiresIn: "15 days"
        });

        res.cookie("user", token);
        res.status(200).send({
          id,
          name: name,
          phone,
          type,
          token
        });
      }
    }
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
  }
};

exports.loginByAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === undefined || email === null || email.length === 0) {
      return res.status(400).send({ message: "연락처를 입력해주세요." });
    }

    if (password === undefined || password === null || password.length === 0) {
      return res.status(400).send({ message: "비밀번호를 입력해주세요." });
    }

    const admin = await Admin.findOne({
      where: {
        email
      }
    });

    if (admin) {
      const { id, name, code } = admin.dataValues;
      if (bcrypt.compareSync(password, admin.dataValues.password)) {
        // create JWT and send data.
        let token = jwt.sign({ id }, DEV_SECRET, {
          expiresIn: "15 days"
        });

        res.cookie("user", token);
        res.status(200).send({
          id,
          name,
          email,
          code,
          token
        });
      }
    }
  } catch (err) {
    res
      .status(400)
      .send({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
  }
};
