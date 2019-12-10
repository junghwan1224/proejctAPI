const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Roster = require("../models").roster;
const models = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const moment = require("moment");
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const startDate = moment().utc();
      console.log(startDate);
      const data = await Roster.findAll({
        where: {
          departure: {
            [Op.gt]: startDate
          }
        },
        attributes: ["departure", "arrival"],
        limit: 4
      });

      res.status(200).send(data);
    } catch (error) {
      res.status(400).send(data);
    }
  })
);
router.post(
  "/create",
  asyncHandler(async (req, res, next) => {
    try {
      const { departure, arrival } = req.body;

      const transaction = await models.sequelize.transaction();

      if (departure) {
        const roster = await Roster.create(
          {
            departure: departure,
            arrival: arrival
          },
          {
            transaction
          }
        );

        await transaction.commit();

        return res.status(201).send(roster);
      } else {
        return res.status(403).send();
      }
    } catch (err) {
      console.log(err);
      res.status(403).send();
    }
  })
);
module.exports = router;
