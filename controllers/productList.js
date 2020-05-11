"use strict";

const Product = require("../models").product;
const Account = require("../models").account;
const AccountLevel = require("../models").account_level;
const { verifyToken } = require("../routes/verifyToken");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

/** Define sequelize in order to use ::raw_query method:: */
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const { Op } = Sequelize;
const calculateDiscount = require("./common/discount").calculateDiscount;

exports.readByUser = async (req, res) => {
  const method = req.query.method || "";
  const methodMap = {
    QUERY: ["query"],
    CAR: ["brand", "model"],
    TYPE: ["type"],
    ID: ["concatenatedID"],
    "*": [],
  };

  /** Raise 400 for invalid method key: */
  if (!Object.keys(methodMap).includes(method.toUpperCase()))
    return res
      .status(400)
      .send({ message: "필요한 정보를 모두 입력해주세요." });

  /** Check out if request has enough arguments: */
  let queryArguments = Object.keys(req.query);
  for (const key of methodMap[method.toUpperCase()]) {
    if (!queryArguments.includes(key))
      return res
        .status(400)
        .send({ message: "필요한 정보를 모두 입력해주세요." });
  }

  /** Set searchField: */
  let searchField = { is_public: true };
  let orderField = [["models", "ASC"]];
  if (method.toUpperCase() === "QUERY") {
    searchField[Op.or] = [
      { oe_number: { [Op.like]: `%${req.query.query}%` } },
      { maker_number: { [Op.like]: `%${req.query.query}%` } },
    ];
  } else if (method.toUpperCase() === "TYPE") {
    searchField.type = { [Op.like]: `%${req.query.type}%` };
  } else if (method.toUpperCase() === "CAR") {
    searchField.models = {
      [Op.like]: `%${[
        req.query.brand.toUpperCase(),
        req.query.model.toUpperCase(),
      ].join("$$")}%`,
    };
  } else if (method.toUpperCase() === "ID") {
    searchField.where = Sequelize.where(
      Sequelize.fn("LOCATE", Sequelize.col("id"), req.query.concatenatedID),
      Sequelize.Op.ne,
      0
    );
    orderField = [["id", "ASC"]];
  } else if (method === "*") {
  } else {
    return res.status(400).send({ message: "유효하지 않은 접근입니다." });
  }

  /* Check if user is logged in, and fetch USER_DISCOUNT: */
  let USER_DISCOUNT = undefined;
  const DEFAULT_DISCOUNT = parseFloat(process.env.DEFAULT_DISCOUNT);
  const { authorization } = req.headers;
  const account_id = authorization
    ? await verifyToken(authorization, "user")
    : null;

  if (account_id) {
    const account = await Account.findOne({
      where: {
        id: account_id,
      },
      include: [
        {
          model: AccountLevel,
          required: true,
          as: "level_detail",
          attributes: ["discount_rate"],
        },
      ],
    });
    USER_DISCOUNT = parseFloat(account.level_detail.discount_rate);
  }

  /* Fetch products and apply discount_rate: */
  try {
    const response = await Product.findAll({
      where: searchField,
      order: orderField,
      attributes: { exclude: ["createdAt", "updatedAt", "is_public", "stock"] },
    });

    let products = [];
    for (const idx of Array(response.length).keys()) {
      let product = response[idx].dataValues;
      const calculated = calculateDiscount(
        USER_DISCOUNT,
        product.price,
        product.allow_discount
      );
      product.price = calculated.price;
      product.originalPrice = calculated.originalPrice;
      product.discountRate = calculated.discountRate;

      products.push(product);
    }

    return res.status(200).send(products);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

exports.readByAdmin = async (req, res) => {
  /* Fetch products and apply discount_rate: */
  try {
    const response = await sequelize.query(
      `select products.*, ifnull(sum(orders.quantity), 0) as sales_quantity from products left join orders on products.id=orders.product_id group by products.id;
   `,
      { type: sequelize.QueryTypes.SELECT }
    );
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};
