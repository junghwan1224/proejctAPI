const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const Favorite = require("../models").favorite;
const verifyToken = require("./verifyToken");

router.get(
  "/list",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { account_id } = req;
    console.log(account_id);

    const raw_favorite_list = await Favorite.findAll({
      raw: true,
      where: { account_id: account_id },
      attributes: ["product_id"]
    });

    let favorite_list = [];
    for (const favorite of raw_favorite_list) {
      favorite_list.push(favorite.product_id);
    }

    res.status(200).send({
      message: "success",
      list: favorite_list
    });
  })
);

router.post(
  "/toggle",
  verifyToken,
  asyncHandler(async (req, res) => {
    const product_id = req.body.product_id;
    const { account_id } = req;

    const favorite_row = await Favorite.findOne({
      where: {
        account_id: account_id,
        product_id: product_id
      }
    });

    if (!favorite_row) {
      Favorite.create({ account_id: account_id, product_id: product_id }).then(
        favorite => res.status(201).send({ message: "push" })
      );
    } else {
      favorite_row.destroy().then(() => {
        res.status(200).send({ message: "pop" });
      });
    }
  })
);

module.exports = router;
