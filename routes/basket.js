const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const ProductAbstract = require("../models").product_abstract;
const Product = require("../models").product;

const Basket = require("../models").basket;

// TODO: account_id 값 추후 변경
router.get(
  "/read",
  asyncHandler(async (req, res) => {
    const account_id = req.query.account_id;

    const raw_items = await Basket.findAll({
      where: {
        account_id: account_id
      },
      attributes: ["quantity"],
      include: [
        {
          model: Product,
          required: true,
          attributes: [
            "id",
            "oe_number",
            "brand",
            "model",
            "start_year",
            "end_year",
            "engine"
          ],
          include: [
            {
              model: ProductAbstract,
              attributes: ["price", "discount_rate", "image", "maker", "type"]
            }
          ]
        }
      ]
    });

    // Fabricate:
    let basket_items = [];
    for (const raw_item of raw_items) {
      let item = {};
      item["quantity"] = raw_item.quantity;
      item["product_id"] = raw_item.product.id;
      item["oen"] = raw_item.product.oe_number;
      item["brand"] = raw_item.product.brand;
      item["model"] = raw_item.product.model;
      item["start_year"] = raw_item.product.start_year;
      item["end_year"] = raw_item.product.end_year;
      item["engine"] = raw_item.product.engine;
      item["price"] = raw_item.product.product_abstract.price;
      item["discount_rate"] = raw_item.product.product_abstract.discount_rate;
      item["image"] = raw_item.product.product_abstract.image;
      item["maker"] = raw_item.product.product_abstract.maker;
      item["description"] = raw_item.product.product_abstract.type;
      basket_items.push(item);
    }

    res.status(200).send(basket_items);
  })
);

router.post(
  "/create-or-update",
  asyncHandler(async (req, res) => {
    const account_id = req.body.account_id;
    const product_id = req.body.product_id;
    const quantity = req.body.quantity;

    const isProductExist = await Basket.count({
      where: {
        account_id,
        product_id
      }
    });
    if (quantity === 0) {
      // Delete if quantity is 0:
      Basket.destroy({
        where: {
          account_id: req.body.account_id,
          product_id: req.body.product_id
        }
      }).then(() => {
        res.status(200).send({ message: "successfully deleted." });
      });
    } else if (!isProductExist) {
      // Create producut
      Basket.create({
        account_id: req.body.account_id,
        product_id: req.body.product_id,
        quantity: req.body.quantity
      });
      res.status(200).send({ message: "successfully created." });
    } else {
      // Update if quantity is not zero and product exists
      const basket = await Basket.findOne({
        where: {
          account_id: account_id,
          product_id: product_id
        }
      });
      basket
        .update({
          quantity: quantity
        })
        .then(() => {
          res.status(200).send({ message: "successfully updated." });
        });
    }
  })
);

module.exports = router;
