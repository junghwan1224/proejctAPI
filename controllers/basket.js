"use strict";

const Basket = require("../models").basket;
const Product = require("../models").product;
const Account = require("../models").account;
const AccountLevel = require("../models").account_level;
const jwt = require("jsonwebtoken");
const DEV_SECRET = process.env.DEV_SECRET;
const calculateDiscount = require("./common").calculateDiscount;

// By user

exports.readByUser = async (req, res) => {
  try {
    // const { account_id } = req;

    // const account_id = "d36d1a36-1f7c-4382-8a16-b325ca279a9c"; // for test only.

    /* Check if user is logged in, and fetch USER_DISCOUNT: */
    let USER_DISCOUNT = undefined;
    const { authorization } = req.headers;
    const account_id = jwt.verify(authorization, DEV_SECRET, (err, decoded) => {
      if (err) {
        return null;
      }
      return decoded.id;
    });
    if (account_id) {
      const account = await Account.findOne({
        where: {
          id: account_id
        },
        include: [
          {
            model: AccountLevel,
            required: true,
            as: "level_detail",
            attributes: ["discount_rate"]
          }
        ]
      });
      USER_DISCOUNT = parseFloat(account.level_detail.discount_rate);
    }

    const response = await Basket.findAll({
      where: {
        account_id
      },
      attributes: ["quantity"],
      include: [
        {
          model: Product,
          required: true,
          attributes: {
            exclude: ["createdAt", "updatedAt", "is_public", "stock"]
          }
        }
      ]
    });

    let carts = [];
    for (const idx of Array(response.length).keys()) {
      const cart = response[idx].product.dataValues;
      cart.quantity = response[idx].quantity;
      const calculated = calculateDiscount(
        USER_DISCOUNT,
        cart.price,
        cart.allow_discount
      );
      cart.price = calculated.price;
      cart.originalPrice = calculated.originalPrice;
      cart.discountRate = calculated.discountRate;
      carts.push(cart);

      // /** Calculate according to the USER_DISCOUNT: */
      // if (USER_DISCOUNT === undefined)
      //   cart[idx].product.price =
      //     Math.round((cart[idx].product.price * (1 + DEFAULT_DISCOUNT)) / 10) *
      //     10;
      // else {
      //   /* Add originalPrice: */
      //   cart[idx].product.setDataValue(
      //     "originalPrice",
      //     Math.round((cart[idx].product.price * (1 + DEFAULT_DISCOUNT)) / 10) *
      //       10
      //   );

      //   /** Update price: */
      //   cart[idx].product.price =
      //     Math.round((cart[idx].product.price * (1 - USER_DISCOUNT)) / 10) * 10;

      //   /* Add discount_rate: */
      //   cart[idx].product.setDataValue(
      //     "discount_rate",
      //     (cart[idx].product.discount_rate = Math.round(
      //       (DEFAULT_DISCOUNT + USER_DISCOUNT) * 100
      //     ))
      //   );
      // }
    }
    res.status(200).send(carts);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.createOrUpdateByUser = async (req, res) => {
  try {
    const { account_id } = req;
    const products = JSON.parse(req.body.products);

    for (const product of products) {
      const product_id = product.product_id;
      const quantity = product.quantity;

      const isProductExist = await Basket.count({
        where: {
          account_id,
          product_id
        }
      });
      if (quantity === 0) {
        // Delete if quantity is 0:
        await Basket.destroy({
          where: {
            account_id,
            product_id
          }
        });
      } else if (!isProductExist) {
        // Create producut
        await Basket.create({
          account_id,
          product_id,
          quantity
        });
      } else {
        // Update if quantity is not zero and product exists
        const basket = await Basket.findOne({
          where: {
            account_id,
            product_id
          }
        });

        await basket.update({
          quantity
        });
      }
    }

    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.deleteByUser = async (req, res) => {
  try {
    const { account_id } = req;

    await Basket.destroy({
      where: { account_id }
    });

    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(400).send();
  }
};
