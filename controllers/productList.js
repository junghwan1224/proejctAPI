"use strict";

const Product = require("../models").product;
const ProductAbstract = require("../models").product_abstract;
const Sequelize = require("sequelize");

const { Op } = Sequelize;

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

exports.readByUser = async (req, res) => {
  const method = req.query.method || "";

  if (method.toUpperCase() === "MAKER") {
    if (!(req.query.category && req.query.oe_number && req.query.year)) {
      return res
        .status(400)
        .send({ message: "필요한 정보를 모두 입력해주세요." });
    }
    try {
      const products = await Product.findAll({
        where: {
          category: req.query.category,
          oe_number: req.query.oe_number,
          [Op.and]: [
            { start_year: { [Op.lte]: req.query.year } },
            { end_year: { [Op.gte]: req.query.year } }
          ],
          is_public: true
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
      is_public: true,
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
      is_public: true,
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
      is_public: true,
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

    return res.status(200).send(fabricated);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};

exports.readByAdmin = async (req, res) => {
  const method = req.query.method || "";

  if (method.toUpperCase() === "ALL") {
    try {
      const products = await Product.findAll({
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
          oe_number: req.query.oe_number,
          is_public: true
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
      is_public: true,
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
      is_public: true,
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
      is_public: true,
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

    return res.status(200).send(fabricated);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
};
