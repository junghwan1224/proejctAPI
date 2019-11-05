var express = require("express");
var router = express.Router();

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
  "id"
];

const PRODUCT_ATTRIBUTES = [
  "price",
  "discount_rate",
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

router.get("/", function(req, res, next) {
  Product.findAll({
    where: {
      category: req.query.category,
      brand: req.query.brand
    },
    attributes: PRODUCT_ATTRIBUTES,
    include: [
      {
        model: ProductAbstract,
        required: true,
        attributes: PRODUCT_ABSTRACT_ATTRIBUTES
      }
    ],
    order: [["brand", "ASC"], ["model", "ASC"]]
  })
    .then(product => {
      res.status(200).send(product);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/abstract/list", function(req, res, next) {
  // Get list of items
  ProductAbstract.findAll()
    .then(productAbstract => {
      res.status(200).send(productAbstract);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/read", function(req, res, next) {
  const category = req.query.category;
  const brand = req.query.brand;
  let where;

  if (category !== "search") {
    where = { brand: brand.toUpperCase() };
  } else {
    where = {
      [Op.or]: [
        { oe_number: { [Op.like]: `%${req.query.brand}%` } },
        { brand: { [Op.like]: `%${req.query.brand}%` } },
        { model: { [Op.like]: `%${req.query.brand}%` } },
        { start_year: { [Op.like]: `%${req.query.brand}%` } },
        { end_year: { [Op.like]: `%${req.query.brand}%` } },
        {
          "$product_abstract.type$": {
            [Op.like]: `%${req.query.brand}%`
          }
        }
      ]
    };
  }

  Product.findAll({
    where: where,
    attributes: PRODUCT_ATTRIBUTES,
    include: [
      {
        model: ProductAbstract,
        required: true,
        attributes: PRODUCT_ABSTRACT_ATTRIBUTES
      }
    ],
    order: [
      ["brand", "ASC"],
      ["model", "ASC"],
      ["oe_number", "ASC"],
      ["price", "DESC"]
    ]
  })
    .then(product => {
      res.status(200).send(product);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.post("/create", function(req, res, next) {
  Product.create({
    abstract_id: req.body.abstract_id,
    brand: req.body.brand,
    model: req.body.model,
    oe_number: req.body.oe_number,
    start_year: req.body.start_year,
    end_year: req.body.end_year,
    engine: req.body.engine,
    price: req.body.price,
    discount_rate: req.body.discount_rate,
    memo: req.body.memo,
    description: req.body.description,
    quality_cert: req.body.quality_cert
  })
    .then(article => res.status(201).send(article))
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.post("/abstract/create", function(req, res, next) {
  ProductAbstract.create({
    id: req.body.id,
    maker: req.body.maker,
    maker_number: req.body.maker_number,
    image: req.body.image,
    stock: req.body.stock,
    type: req.body.type
  })
    .then(article => res.status(201).send(article))
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

/**
 * ARK
 */
router.get("/ark/fetch-product-ratio", function(req, res, next) {
  ProductAbstract.findAll({
    attributes: ["type"]
  })
    .then(products => {
      let pmap = {};
      for (const product of products) {
        if (Object.keys(pmap).includes(product.type)) {
          pmap[product.type] += 1;
        } else {
          pmap[product.type] = 1;
        }
      }
      res.status(200).send(pmap);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/ark/product-list", function(req, res, next) {
  Product.findAll({
    attributes: PRODUCT_ATTRIBUTES,
    include: [
      {
        model: ProductAbstract,
        required: true,
        attributes: PRODUCT_ABSTRACT_ATTRIBUTES
      }
    ],
    order: [
      ["brand", "ASC"],
      ["model", "ASC"],
      ["oe_number", "ASC"],
      ["price", "DESC"]
    ]
  })
    .then(products => {
      let fabricated = [];
      for (const product of products) {
        fabricated.push({
          oe_number: product.oe_number,
          price: product.price,
          maker: product.product_abstract.maker,
          brand: product.brand,
          model: product.model,
          quantity: product.product_abstract.stock
        });
      }
      res.status(200).send(fabricated);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

module.exports = router;
