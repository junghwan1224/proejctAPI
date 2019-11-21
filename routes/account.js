const DEV_SECRET = process.env.DEV_SECRET;

var express = require("express");
var router = express.Router();
const axios = require("axios");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Account = require("../models").account;
const Address = require("../models").address;
const models = require("../models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken");

const makeSignature = require("../public/js/signature");
const SENS_API_V2_URL =
  process.env.SENS_API_V2_URL + process.env.SENS_API_V2_URI;
const SENS_ACCESS_KEY = process.env.SENS_ACCESS_KEY;
const SENS_SENDER = process.env.SENS_SENDER;

// const verifyToken = require("./index");
/* GET users listing. */

router.get("/exist", function(req, res, next) {
  Account.findOne({
    where: { phone: req.query.phone },
    attributes: ["phone"]
  }).then(account => {
    if (account) {
      res.status(200).send({ isValid: true });
    } else {
      res.status(200).send({ isValid: false });
    }
  });
});

router.post("/login", function(req, res, next) {
  const { phone, password } = req.body;

  if (phone === undefined || phone === null || phone.length === 0) {
    return res.status(403).send({ message: "연락처를 입력해주세요." });
  }

  if (password === undefined || password === null || password.length === 0) {
    return res.status(403).send({ message: "비밀번호를 입력해주세요." });
  }

  Account.findOne({
    where: { phone: req.body.phone },
    attributes: ["id", "name", "password", "phone", "crn", "email", "mileage"]
  }).then(account => {
    if (account) {
      // If hashed password === stored password:
      if (bcrypt.compareSync(req.body.password, account.dataValues.password)) {
        // create JWT and send data.
        let token = jwt.sign({ id: account.id }, DEV_SECRET, {
          expiresIn: "15 days"
        });
        res.cookie("user", token);
        res.status(200).send({
          id: account.id,
          name: account.name,
          crn: account.crn,
          phone: account.phone,
          email: account.email,
          mileage: account.mileage,
          token: token
        });
      } else {
        // password does not match
        res
          .status(400)
          .send({ error_message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }
    } else {
      // id not found
      res
        .status(400)
        .send({ error_message: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }
  });
});

router.get("/read", verifyToken, function(req, res, next) {
  Account.findByPk(req.account_id)
    .then(account => {
      res.status(200).send({
        id: account.id,
        phone: account.phone,
        name: account.name,
        password: account.password,
        mileage: account.mileage,
        email: account.email,
        crn: account.crn,
        address1: account.address1,
        address2: account.address2
      });
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.post(
  "/create",
  asyncHandler(async (req, res, next) => {
    try {
      const { phone, crn } = req.body;

      const transaction = await models.sequelize.transaction();

      const userByPhone = await Account.findOne({
        where: { phone },
        transaction
      });

      const userByCRN = await Account.findOne({
        where: { crn },
        transaction
      });

      if (!userByPhone && !userByCRN) {
        const account = await Account.create(
          {
            phone: req.body.phone,
            password: req.body.password,
            name: req.body.name,
            crn: req.body.crn
          },
          {
            transaction
          }
        );

        await transaction.commit();

        return res.status(201).send({ account, message: "가입 성공" });
      } else if (userByPhone && userByCRN) {
        return res
          .status(403)
          .send({ message: "이미 등록된 연락처와 사업자 등록번호입니다." });
      } else if (userByPhone) {
        return res
          .status(403)
          .send({ message: "연락처가 이미 등록되어 있습니다." });
      } else if (userByCRN) {
        return res
          .status(403)
          .send({ message: "사업자 등록번호가 이미 등록되어 있습니다." });
      }
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.post(
  "/issue-certify-num",
  asyncHandler(async (req, res) => {
    try{
      const { phone } = req.body;

      // 인증 번호 난수 6자리 생성 및 세션에 저장
      const certifyNumber = Math.floor(Math.random() * 899999 + 100000);

      const sess = req.session;
      sess.certifyNumber = certifyNumber;

      req.session.save(err => {
        if (err) {
          console.log("session save error");
          console.log(err);
        }
      });

      // SMS 전송
      const timestamp = new Date().getTime().toString();

      const sms = await axios({
        url: SENS_API_V2_URL,
        method: "post",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "x-ncp-apigw-timestamp": timestamp,
          "x-ncp-iam-access-key": SENS_ACCESS_KEY,
          "x-ncp-apigw-signature-v2": makeSignature(timestamp)
        },
        data: {
          type: "SMS",
          from: SENS_SENDER,
          content: `HERMES 인증번호 [${certifyNumber}]를 입력해주세요.`,
          messages: [
            {
              to: phone
            }
          ]
        }
      });

      // 문자 전송 성공
      if (sms.data.statusCode === "202") {
        res.status(201).send({ message: "인증번호가 발송되었습니다." });
      }
      // 문자 전송 실패
      else {
        res.status(403).send({
          message: "인증번호 발송 중 에러가 발생했습니다. 다시 시도해주세요."
        });
      }
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.post(
  "/certify",
  asyncHandler(async (req, res) => {
    try{
      const { certifyNumber } = req.body;

      // 저장된 인증번호와 비교
      if (parseInt(certifyNumber) === req.session.certifyNumber) {
        req.session.destroy(err => {
          if (err) {
            console.log("session destory error");
            console.log(err);
          }
        });

        return res
          .status(201)
          .send({ message: "인증이 정상적으로 완료되었습니다." });
      } else {
        return res
          .status(403)
          .send({ message: "인증번호가 일치하지 않습니다. 다시 입력해주세요." });
      }
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.get(
  "/get-address/",
  verifyToken,
  asyncHandler(async (req, res) => {
    try{
      const { account_id } = req;

      const transaction = await models.sequelize.transaction();

      const user = await Account.findOne({
        where: { id: account_id },
        transaction
      });

      const address = await Address.findAll({
        where: { account_id: { [Op.in]: [user.dataValues.id] } },
        transaction
      });

      await transaction.commit();

      if (!address.length) {
        return res.send({ message: "success", address: null });
      } else {
        return res.send({ message: "success", address: address[0].dataValues });
      }
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.post(
  "/set-address",
  verifyToken,
  asyncHandler(async (req, res) => {
    try {
      const { account_id } = req;
      const { addr_postcode, addr_primary, addr_detail } = req.body;

      const transaction = await models.sequelize.transaction();

      const address = await Address.findOne({
        where: { account_id },
        transaction
      });

      if (address) {
        const { postcode, primary, detail } = address.dataValues;

        const obj = {
          postcode: addr_postcode,
          primary: addr_primary,
          detail: addr_detail
        };

        const addr = {
          postcode,
          primary,
          detail
        };

        if (!Object.is(JSON.stringify(obj), JSON.stringify(addr))) {
          await Address.update(
            {
              postcode: addr_postcode,
              primary: addr_primary,
              detail: addr_detail
            },
            {
              where: { id: address.dataValues.id },
              transaction
            }
          );

          await transaction.commit();

          return res.status(201).send({ message: "update success" });
        }
      } else {
        await Address.create(
          {
            account_id,
            postcode: addr_postcode,
            primary: addr_primary,
            detail: addr_detail
          },
          {
            transaction
          }
        );

        await transaction.commit();

        return res.status(200).send({ message: "create success" });
      }

      res.send({ message: "success" });
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.post(
  "/set-email",
  verifyToken,
  asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      const { account_id } = req;

      const transaction = await models.sequelize.transaction();

      const user = await Account.findOne({
        where: { id: account_id },
        transaction
      });

      if (email !== user.dataValues.email) {
        await Account.update(
          {
            email
          },
          {
            where: { id: account_id },
            transaction
          }
        );

        await transaction.commit();

        return res.status(201).send({ message: "update success" });
      }

      res.status(200).send({ message: "success" });
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.post(
  "/change-pwd",
  verifyToken,
  asyncHandler(async (req, res) => {
    try {
      const { account_id } = req;
      const { password, new_password } = req.body;

      const transaction = await models.sequelize.transaction();

      const user = await Account.findOne({
        where: { id: account_id },
        transaction
      });

      if (bcrypt.compareSync(password, user.dataValues.password)) {
        const bcryptPwd = bcrypt.hashSync(new_password, 10);
        await Account.update(
          {
            password: bcryptPwd
          },
          {
            where: { id: account_id },
            transaction
          }
        );

        await transaction.commit();

        return res.status(201).send({ message: "update success" });
      } else {
        return res
          .status(400)
          .send({ message: "기존 비밀번호가 일치하지 않습니다." });
      }
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.post(
  "/set-new-pwd",
  asyncHandler(async (req, res) => {
    try{
      const { phone, new_password } = req.body;
      const transaction = await models.sequelize.transaction();

      const bcryptPwd = bcrypt.hashSync(new_password, 10);
      await Account.update({
        password: bcryptPwd
      },
      {
        where: { phone },
        transaction
      });

      await transaction.commit();

      res.status(201).send({ message: "비밀번호가 성공적으로 변경되었습니다." });
    }
    catch(err) {
      return res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
}));

router.post(
  "/issue-temporary-pwd",
  asyncHandler(async (req, res) => {
    try {
      const { phone } = req.body;
      const temporaryPwd = Math.floor(
        Math.random() * 89999999 + 10000000
      ).toString();

      const bcryptPwd = bcrypt.hashSync(temporaryPwd, 10);

      const transaction = await models.sequelize.transaction();

      const user = await Account.findOne({
        where: { phone },
        transaction
      });

      await Account.update(
        {
          password: bcryptPwd
        },
        {
          where: { phone },
          transaction
        }
      );

      // SMS 전송
      const timestamp = new Date().getTime().toString();

      const sms = await axios({
        url: SENS_API_V2_URL,
        method: "post",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "x-ncp-apigw-timestamp": timestamp,
          "x-ncp-iam-access-key": SENS_ACCESS_KEY,
          "x-ncp-apigw-signature-v2": makeSignature(timestamp)
        },
        data: {
          type: "SMS",
          from: SENS_SENDER,
          content: `임시 비밀번호 [${temporaryPwd}]가 발급되었습니다.`,
          messages: [
            {
              to: user.dataValues.phone
            }
          ]
        }
      });

      if (sms.data.statusCode === "202") {
        await transaction.commit();

        res
          .status(201)
          .send({ message: "임시 비밀번호를 SMS로 발송해드립니다." });
      } else {
        res.status(403).send({
          message: "인증번호 발송 중 에러가 발생했습니다. 다시 시도해주세요."
        });
      }
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

router.delete(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    try {
      const { account_id } = req;

      await Account.destroy({
        where: { id: account_id }
      });

      res.status(201).send({ message: "delete success" });
    }
    catch(err) {
      res.status(403).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

module.exports = router;
