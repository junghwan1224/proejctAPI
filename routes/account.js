const DEV_SECRET = "NEED TO CHANGE THIS TO ENV FILE";

var express = require("express");
var router = express.Router();
const axios = require("axios");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Account = require("../models").account;
const Address = require("../models").address;
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const jwt = require("jsonwebtoken");

const makeSignature = require("../public/js/signature");
const SENS_API_V2_URL = "https://sens.apigw.ntruss.com/sms/v2/services/ncp:sms:kr:257098754703:hermes_test/messages";
const SENS_ACCESS_KEY = "e3ufC3LRgOjDtrguluqL";
const SENS_SENDER = "01024569959";

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

  if(phone === undefined || phone === null || phone.length === 0) {
    return res.status(403).send({ message: "연락처를 입력해주세요." });
  }

  if(password === undefined || password === null || password.length === 0) {
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
        let token = jwt.sign({ uuid: req.query.uuid }, DEV_SECRET, {
          expiresIn: "9999h"
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

router.get("/read", function(req, res, next) {
  Account.findByPk(parseInt(req.query.id))
    .then(account => {
      res.status(200).send({
        id: account.id,
        phone: account.phone,
        name: account.name,
        password: account.password,
        mileage: account.mileage,
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
    const { phone, crn } = req.body;

    const userByPhone = await Account.findOne({
      where: { phone }
    });

    const userByCRN = await Account.findOne({
      where: { crn }
    });

    if (!userByPhone && !userByCRN) {
      const account = await Account.create({
        phone: req.body.phone,
        password: req.body.password,
        name: req.body.name,
        crn: req.body.crn
      });

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
  })
);

router.post("/issue-certify-num", asyncHandler(async(req, res) => {
  const { phone } = req.body;

  // 인증 번호 난수 6자리 생성 및 세션에 저장
  const certifyNumber = Math.floor(Math.random() * 899999 + 100000);
  
  const sess = req.session;
  sess.certifyNumber = certifyNumber;

  req.session.save(err => {
    if(err) {
      console.log("session save error");
      console.log(err);
    }
  });

  // SMS 전송
  const timestamp = new Date().getTime().toString();

  await axios({
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
          messages: [{
              to: phone
          }]
      }
  });

  res.status(201).send({ message: "인증번호가 발송되었습니다." });
}));

router.post("/certify", asyncHandler(async(req, res) => {
  const { certifyNumber } = req.body;

  // 저장된 인증번호와 비교
  if(parseInt(certifyNumber) === req.session.certifyNumber) {

    req.session.destroy(err => {
      if(err) {
        console.log("session destory error");
        console.log(err);
      }
    });

    return res.status(201).send({ message: "인증이 정상적으로 완료되었습니다." });
  }
  else {
    return res.status(403).send({ message: "인증번호가 일치하지 않습니다. 다시 입력해주세요." });
  }
}));

router.get(
  "/get-address/",
  asyncHandler(async (req, res) => {
    const { id } = req.query;

    const user = await Account.findOne({
      where: { id }
    });

    const address = await Address.findAll({
      where: { account_id: { [Op.in]: [user.dataValues.id] } }
    });

    if (!address.length) {
      return res.send({ message: "success", address: null });
    } else {
      return res.send({ message: "success", address: address[0].dataValues });
    }
  })
);

router.post(
  "/set-address",
  asyncHandler(async (req, res) => {
    const { id, addr_postcode, addr_primary, addr_detail } = req.body;

    const address = await Address.findOne({
      where: { account_id: id }
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
            where: { id: address.dataValues.id }
          }
        );

        return res.status(201).send({ message: "update success" });
      }
    } else {
      await Address.create({
        account_id: id,
        postcode: addr_postcode,
        primary: addr_primary,
        detail: addr_detail
      });

      return res.status(201).send({ message: "create success" });
    }

    res.send({ message: "success" });
  })
);

router.post(
  "/set-email",
  asyncHandler(async (req, res) => {
    const { id, email } = req.body;

    const user = await Account.findOne({
      where: { id }
    });

    if (email !== user.dataValues.email) {
      await Account.update(
        {
          email
        },
        {
          where: { id }
        }
      );

      return res.status(201).send({ message: "update success" });
    }

    res.status(201).send({ message: "success" });
  })
);

router.post(
  "/set-new-pwd",
  asyncHandler(async (req, res) => {
    const { id, password, new_password } = req.body;

    const user = await Account.findOne({
      where: { id }
    });

    if (bcrypt.compareSync(password, user.dataValues.password)) {
      const bcryptPwd = bcrypt.hashSync(new_password, 10);
      await Account.update(
        {
          password: bcryptPwd
        },
        {
          where: { id }
        }
      );

      return res.status(201).send({ message: "update success" });
    } else {
      return res.status(403).send({ message: "기존 비밀번호 불일치" });
    }
  })
);

router.post(
  "/delete-account",
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    await Account.destroy({
      where: { id }
    });

    res.status(201).send({ message: "delete success" });
  })
);

module.exports = router;
