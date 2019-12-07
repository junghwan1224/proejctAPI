const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const Delivery = require("../models").delivery;

// TODO: account_id 값 추후 변경
router.get(
  "/read",
  asyncHandler(async (req, res) => {
    const { account_id } = req.query;

    const data = await Delivery.findAll({
      where: {
        account_id: account_id
      },
      attributes: ["postcode", "primary", "detail"]
    });

    res.status(200).send(data);
  })
);

module.exports = router;
