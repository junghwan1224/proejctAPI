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
  "type"
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
  "quality_cert"
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

// /******************************************************************* */
// /* GET users listing. */

// router.get("/detail", function(req, res, next) {
//   Product.findAll({
//     where: {
//       oe_number: req.query.oen,
//       model: req.query.model
//     },
//     attributes: [
//       "id",
//       "oe_number",
//       "brand",
//       "model",
//       "start_year",
//       "end_year",
//       "engine"
//     ],
//     include: [
//       {
//         model: ProductAbstract,
//         required: true,
//         attributes: [
//           "price",
//           "discount_rate",
//           "type",
//           "image",
//           "maker",
//           "quality_cert",
//           "id"
//         ]
//       }
//     ]
//   })
//     .then(product => {
//       res.status(200).send(product);
//     })
//     .catch(error => {
//       console.log(error);
//       res.status(400).send(error);
//     });
// });

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

// router.get("/list/all", function(req, res, next) {
//   Product.findAll({
//     attributes: PRODUCT_ATTRIBUTES,
//     include: [
//       {
//         model: ProductAbstract,
//         required: true,
//         attributes: PRODUCT_ABSTRACT_ATTRIBUTES
//       }
//     ],
//     order: [["brand", "ASC"], ["model", "ASC"]]
//   })
//     .then(product => {
//       res.status(200).send(product);
//     })
//     .catch(error => {
//       console.log(error);
//       res.status(400).send(error);
//     });
// });

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

// router.get("/list/query", function(req, res, next) {
//   Product.findAll({
//     where: {
//       [Op.or]: [
//         { oe_number: { [Op.like]: `%${req.query.query_string}%` } },
//         { brand: { [Op.like]: `%${req.query.query_string}%` } },
//         { model: { [Op.like]: `%${req.query.query_string}%` } },
//         { start_year: { [Op.like]: `%${req.query.query_string}%` } },
//         { end_year: { [Op.like]: `%${req.query.query_string}%` } },
//         {
//           "$product_abstract.type$": {
//             [Op.like]: `%${req.query.query_string}%`
//           }
//         }
//       ]
//     },
//     attributes: ["id", "oe_number", "brand", "model", "start_year", "end_year"],
//     include: [
//       {
//         model: ProductAbstract,
//         required: true,
//         attributes: ["price", "discount_rate", "type"]
//       }
//     ],
//     order: [["brand", "ASC"], ["model", "ASC"]]
//   })
//     .then(product => {
//       res.status(200).send(product);
//     })
//     .catch(error => {
//       console.log(error);
//       res.status(400).send(error);
//     });
// });

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

module.exports = router;
