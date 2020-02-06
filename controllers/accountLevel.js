"use strict";

const AccountLevel = require("../models").account;

exports.createByAdmin = (req, res) => {
  if (!(req.body.name && req.body.discount_rate)) {
    return res.status(400).send({
      text: "No sufficient data."
    });
  }

  AccountLevel.create({
    name: req.body.name,
    discount_rate: req.body.discount_rate
  }).then(account => {
    res.status(200).send();
  });
};

exports.readByAdmin = (req, res) => {
  AccountLevel.findAll().then(account => {
    res.status(200).send(account);
  });
};

// exports.updateByUser = (req, res) => {
//   let POSSIBLE_ATTRIBUTES = ["email", "crn", "name", "type", "password"];
//   let newData = {};

//   POSSIBLE_ATTRIBUTES.map(
//     attribute => (newData[attribute] = req.body[attribute])
//   );

//   AccountLevel.update(newData, {
//     where: {
//       id: req.query.account_id
//     }
//   }).then(account => {
//     res.status(200).send();
//   });
// };

// exports.deleteByAdmin = (req, res) => {
//   AccountLevel.destroy({
//     where: { id: req.query.account_id },
//     limit: 1
//   }).then(account => {
//     res.status(200).send();
//   });
// };
