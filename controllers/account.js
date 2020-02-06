"use strict";

const Account = require("../models").account;

exports.createByUser = (req, res) => {
  if (
    !(req.body.phone && req.body.password && req.body.name && req.body.type)
  ) {
    return res.status(400).send({
      text: "No sufficient data."
    });
  }

  Account.create({
    phone: req.body.phone,
    password: req.body.password,
    name: req.body.name,
    crn: req.body.crn,
    type: req.body.type,
    email: req.body.email
  }).then(account => {
    res.status(200).send();
  });
};

exports.readByUser = (req, res) => {
  const ALLOWED_ATTRIBUTES = [
    "id",
    "phone",
    "name",
    "email",
    "crn",
    "type",
    "mileage"
  ];
  const fields = req.query.fields;
  const account_id = req.query.account_id;
  Account.findByPk(account_id, {
    attributes: ALLOWED_ATTRIBUTES
  }).then(account => {
    if (account) {
      const attributes = fields.toLowerCase().split(",");
      let data = {};
      if (fields.toLowerCase() != "all") {
        attributes.map(
          attribute => (data[attribute.trim()] = account[attribute.trim()])
        );
      } else {
        data = account;
      }
      res.status(200).send(data);
    } else {
      res.status(400).send({ text: "User data not found." });
    }
  });
};

exports.updateByUser = (req, res) => {
  let POSSIBLE_ATTRIBUTES = ["email", "crn", "name", "type", "password"];
  let newData = {};

  POSSIBLE_ATTRIBUTES.map(
    attribute => (newData[attribute] = req.body[attribute])
  );

  Account.update(newData, {
    where: {
      id: req.query.account_id
    }
  }).then(account => {
    res.status(200).send();
  });
};

exports.deleteByAdmin = (req, res) => {
  Account.destroy({
    where: { id: req.query.account_id },
    limit: 1
  }).then(account => {
    res.status(200).send();
  });
};
