const DEV_SECRET = "NEED TO CHANGE THIS TO ENV FILE";

var express = require("express");
var router = express.Router();

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Account = require("../models").account;
const Address = require("../models").address;
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const jwt = require("jsonwebtoken");

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
  Account.findOne({
    where: { phone: req.body.phone },
    attributes: ["id", "name", "password"]
  }).then(account => {
    if (account) {
      // If hashed password === stored password:
      if (bcrypt.compareSync(req.body.password, account.dataValues.password)) {
        // create JWT and send data.
        let token = jwt.sign({ uuid: req.query.uuid }, DEV_SECRET, {
          expiresIn: "9999h"
        });
        res.cookie("user", token);
        res
          .status(200)
          .send({ id: account.id, name: account.name, token: token });
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

router.post("/create", function(req, res, next) {
  try {
    Account.create({
      phone: req.body.phone,
      password: req.body.password,
      name: req.body.name,
      crn: req.body.crn
    })
      .then(account => res.status(201).send(account))
      .catch(error => {
        console.log(error);
        res.status(400).send(error);
      });
  } catch (error) {
    console.log(error);
  }
});

router.post("/certify", asyncHandler(async(req, res) => {
  const { phone } = req.body;

  const user = await Account.findOne({
    where: { phone }
  });

  if(! user) {
    return res.status(201).send({ message: "인증이 완료되었습니다." });
  }

  else {
    return res.status(403).send({ message: "이미 가입된 연락처입니다." });
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
      where: { id: { [Op.in]: [user.dataValues.id] } }
    });

    res.send({ message: "success", address: address[0].dataValues });
  })
);

router.post(
  "/set-address",
  asyncHandler(async (req, res) => {
    const { id, addr_postcode, addr_primary, addr_detail } = req.body;
    const user = await Account.findOne({
      where: { id }
    });

    const { account_id } = user.dataValues;
    const address = await Address.findOne({
      where: { account_id: account_id }
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

router.post("/delete-account", asyncHandler(async (req, res) => {
  const { id } = req.body;

  await Account.destroy({
    where: { id }
  });

  res.status(201).send({ message: "delete success" });
}));

module.exports = router;
