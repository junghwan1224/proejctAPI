"use strict";

const AccountLevel = require("../models").account_level;

exports.createByAdmin = (req, res) => {
  if (!req.body.discount_rate) {
    return res.status(400).send({
      text: "No sufficient data."
    });
  }

  AccountLevel.create({
    id: req.body.id,
    discount_rate: req.body.discount_rate
  })
    .then(account => {
      res.status(201).send();
    })
    .catch(error => {
      console.log(error);
    });
};

exports.readByAdmin = (req, res) => {
  AccountLevel.findAll({ attributes: ["discount_rate"] }).then(accountLevel => {
    res.status(200).send(accountLevel);
  });
};
