"use strict";

const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const Sequelize = require("sequelize");

const Op = Sequelize.Op;
const PRODUCT_ABSTRACT_ATTRIBUTES = [
  "image",
  "maker",
  "maker_number",
  "stock",
  "type",
  "id",
  "allow_discount"
];

const PRODUCT_ATTRIBUTES = [
  "price",
  "brand",
  "model",
  "oe_number",
  "start_year",
  "end_year",
  "engine",
  "description",
  "quality_cert",
  "id"
];
exports.createByAdmin = async (req, res) => {
  /* If phone, pafssword, name, type are not included, return 400: */
  if (
    !(
      req.body.abstract_id &&
      req.body.category &&
      req.body.brand &&
      req.body.model &&
      req.body.oe_number &&
      req.body.start_year &&
      req.body.end_year &&
      req.body.engine &&
      req.body.price
    )
  ) {
    return res.status(400).send({
      message: "필요한 정보를 모두 입력해주세요."
    });
  }

  /* Set default values: */
  req.body.description = req.body.description ? req.body.description : "";
  req.body.memo = req.body.memo ? req.body.memo : "";
  req.body.quality_cert = req.body.quality_cert ? req.body.quality_cert : "";
  req.body.is_public = req.body.is_public ? req.body.is_public : 1;

  /* Verify whether requested product_abstract_id is valid: */
  try {
    let response = await ProductAbstract.findOne({
      where: {
        id: req.body.abstract_id
      }
    });
    if (!response) {
      return res.status(400).send({
        message: "Invalid abstract_id."
      });
    }

    /* Append data to DB: */
    response = await Product.create({
      abstract_id: req.body.abstract_id,
      category: req.body.category,
      brand: req.body.brand,
      model: req.body.model,
      oe_number: req.body.oe_number,
      start_year: req.body.start_year,
      end_year: req.body.end_year,
      engine: req.body.engine,
      price: req.body.price,
      memo: req.body.memo,
      description: req.body.description,
      quality_cert: req.body.quality_cert,
      is_public: req.body.is_public
    });
    return res.status(201).send(response);
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.readByUser = async (req, res) => {
  const method = req.query.method;

  if (method.toUpperCase() === "MAKER") {
    if (!(req.query.category && req.query.oe_number)) {
      return res
        .status(400)
        .send({ message: "필요한 정보를 모두 입력해주세요." });
    }
    try {
      const products = await Product.findAll({
        where: {
          category: req.query.category,
          oe_number: req.query.oe_number
        },
        attributes: PRODUCT_ATTRIBUTES,
        include: [
          {
            model: ProductAbstract,
            required: true,
            as: "product_abstract",
            attributes: PRODUCT_ABSTRACT_ATTRIBUTES
          }
        ],
        order: [
          ["brand", "ASC"],
          ["model", "ASC"]
        ]
      });

      return res.status(200).send(products);
    } catch (err) {
      return res
        .status(400)
        .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  }
  /* Search Method: */

  let where = {};
  if (method.toUpperCase() === "CAR") {
    /* 차량별 검색 : 패러미터 category, year,brand,model에 대한 제품 리스트 반환 */
    if (
      !(
        req.query.category &&
        req.query.year &&
        req.query.brand &&
        req.query.model
      )
    ) {
      return res
        .status(400)
        .send({ message: "필요한 정보를 모두 입력해주세요." });
    }
    where = {
      category: req.query.category,
      brand: req.query.brand,
      model: req.query.model,
      [Op.and]: [
        { start_year: { [Op.lte]: req.query.year } },
        { end_year: { [Op.gte]: req.query.year } }
      ]
    };
  } else if (method.toUpperCase() === "TYPE") {
    /* 부품 별 검색: 패러미터 type에 대한 제품 리스트 반환 */
    if (!(req.query.category && req.query.type)) {
      return res
        .status(400)
        .send({ message: "필요한 정보를 모두 입력해주세요." });
    }
    where = {
      category: req.query.category,
      "$product_abstract.type$": { [Op.like]: `%${req.query.type}%` }
    };
  } else if (method.toUpperCase() === "OEN") {
    /* OEN으로 검색: 패러미터 쿼리에 상응하는 OEN을 가진 제품 리스트 반환 */
    if (!(req.query.category && req.query.oe_number)) {
      return res
        .status(400)
        .send({ message: "필요한 정보를 모두 입력해주세요." });
    }
    where = {
      category: req.query.category,
      oe_number: { [Op.like]: `%${req.query.oe_number}%` }
    };
  } else {
    return res.status(400).send({ message: "method 값이 유효하지 않습니다." });
  }

  try {
    const products = await Product.findAll({
      where: where,
      attributes: PRODUCT_ATTRIBUTES,
      include: [
        {
          model: ProductAbstract,
          required: true,
          as: "product_abstract",
          attributes: PRODUCT_ABSTRACT_ATTRIBUTES
        }
      ],
      order: [
        ["brand", "ASC"],
        ["model", "ASC"]
      ]
    }).map(p => p.dataValues);

    let fabricated = {};
    for (const product of products) {
      if (
        fabricated[product.oe_number] &&
        fabricated[product.oe_number].price < product.price
      ) {
        continue;
      }
      fabricated[product.oe_number] = product;
    }

    // send
    return res.status(200).send(fabricated);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.updateByAdmin = async (req, res) => {
  let response = {};
  try {
    response = await Product.findOne({
      where: {
        id: req.body.product_id
      }
    });

    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id 값입니다." });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }

  /* Create product-abstract Promise: */
  let product_abstract_data = {};
  for (const attribute of PRODUCT_ABSTRACT_ATTRIBUTES) {
    product_abstract_data[attribute] = req.body[attribute];
  }
  const promise_product_abstract = ProductAbstract.update(
    {
      image: req.body.image,
      maker: req.body.maker,
      maker_number: req.body.maker_number,
      stock: req.body.stock,
      type: req.body.type,
      allow_discount: req.body.allow_discount
    },
    {
      where: { id: response.abstract_id }
    }
  );

  /* Create product Promise: */
  let product_data = {};
  for (const attribute of PRODUCT_ATTRIBUTES) {
    product_data[attribute] = req.body[attribute];
  }
  const promise_product = Product.update(
    {
      brand: req.body.brand,
      model: model,
      oe_number: oe_number,
      start_year: start_year,
      end_year: end_year,
      engine: engine,
      price: price,
      quality_cert: quality_cert,
      product_abstract: product_abstract,
      is_public: is_public
    },
    {
      where: { id: product_id }
    }
  );

  /* Request a Promise */
  Promise.all([promise_product, promise_product_abstract])
    .then(() => {
      return res.status(200).send();
    })
    .catch(err => {
      return res.status(400).send({
        message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요."
      });
    });
};

exports.deleteByAdmin = async (req, res) => {
  /* Send 400 if account_id is not given: */
  try {
    if (!req.body.product_id) {
      return res.status(400).send({
        message: "필요한 정보를 모두 입력해주세요."
      });
    }
    /* Verify whether the user exists: */
    const response = await Product.findOne({
      where: { id: req.body.account_id }
    });
    if (!response) {
      return res
        .status(400)
        .send({ message: "유효하지 않은 product_id입니다." });
    }

    /* Delete account data from the DB: */
    await Product.destroy({
      where: { id: req.body.product_id },
      limit: 1
    });
    return res.status(200).send();
  } catch (err) {
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
