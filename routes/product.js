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

router.get("/unique-oen", function(req, res, next) {
  let where;
  if (req.query.query) {
    where = {
      is_public: 1,
      [Op.or]: [
        { oe_number: { [Op.like]: `%${req.query.query}%` } },
        { brand: { [Op.like]: `%${req.query.query}%` } },
        { model: { [Op.like]: `%${req.query.query}%` } },
        { start_year: { [Op.like]: `%${req.query.query}%` } },
        { end_year: { [Op.like]: `%${req.query.query}%` } },
        {
          "$product_abstract.type$": {
            [Op.like]: `%${req.query.brand}%`
          }
        }
      ]
    };
  } else if (req.query.brand) {
    where = {
      is_public: 1,
      brand: req.query.brand
    };
  } else {
    res.status(200).send({});
    return;
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
      ["model", "ASC"]
    ]
  })
    .then(raw_products => {
      let fabricated = {};
      for (const product in raw_products) {
        if (
          fabricated[product.oe_number] &&
          fabricated[product.oe_number].price < product.price
        ) {
          continue;
        }
        fabricated[product.oe_number] = product;
      }

      res.status(200).send(raw_products);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/", function(req, res, next) {
  Product.findAll({
    where: {
      category: req.query.category,
      brand: req.query.brand,
      is_public: 1
    },
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
      ["model", "ASC"]
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

router.get("/abstract/list", function(req, res, next) {
  // Get list of items
  ProductAbstract.findAll({
    where: {
      is_public: 1
    }
  })
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
    where = { brand: brand.toUpperCase(), is_public: 1 };
  } else {
    where = {
      is_public: 1,
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
    quality_cert: req.body.quality_cert,
    is_public: req.body.is_public
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

router.get("/ark/product-list", function(req, res, next) {
  Product.findAll({
    include: [
      {
        model: ProductAbstract,
        required: true
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
          product_id: product.id,
          oe_number: product.oe_number,
          price: product.price,
          maker: product.product_abstract.maker,
          maker_number: product.product_abstract.maker_number,
          brand: product.brand,
          model: product.model,
          quantity: product.product_abstract.stock,
          is_public: product.is_public
        });
      }
      res.status(200).send(fabricated);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/ark/product-detail", function(req, res, next) {
  Product.findOne({
    where: { id: req.query.productID },
    include: [
      {
        model: ProductAbstract,
        required: true,
        attributes: ["image", "maker", "maker_number", "stock", "type"]
      }
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

router.post("/ark/update-product", function(req, res, next) {
  const {
    productID,
    productAbstractID,
    brand,
    model,
    oe_number,
    start_year,
    end_year,
    engine,
    price,
    discount_rate,
    quality_cert,
    product_abstract,
    is_public
  } = req.body;

  const promise_product_abstract = ProductAbstract.update(product_abstract, {
    where: { id: productAbstractID }
  });

  const promise_product = Product.update(
    {
      brand: brand,
      model: model,
      oe_number: oe_number,
      start_year: start_year,
      end_year: end_year,
      engine: engine,
      price: price,
      discount_rate: discount_rate,
      quality_cert: quality_cert,
      product_abstract: product_abstract,
      is_public: is_public
    },
    {
      where: { id: productID }
    }
  );

  Promise.all([promise_product, promise_product_abstract])
    .then(() => {
      return res.status(201).send({ message: "update success" });
    })
    .catch(error => {
      console.log(error);
      return res.status(400).send();
    });
});

// router.post("/ark/update-product", function(req, res, next) {
//   Product.update(
//     {
//       brand: brand,
//       model: model,
//       oe_number: oe_number,
//       start_year: start_year,
//       end_year: end_year,
//       engine: engine,
//       price: price,
//       discount_rate: discount_rate,
//       quality_cert: quality_cert
//     },
//     {
//       where: { id: productID },
//       transaction
//     }
//   )
//     .then(product => {
//       res.status(200).send(product);
//     })
//     .catch(error => {
//       console.log(error);
//       res.status(400).send(error);
//     });

//   // Product.findOne({
//   //   where: { id: req.query.productID },
//   //   attributes: [
//   //     "id",
//   //     "abstract_id",
//   //     "brand",
//   //     "model",
//   //     "oe_number",
//   //     "start_year",
//   //     "end_year",
//   //     "engine",
//   //     "price",
//   //     "discount_rate",
//   //     "memo",
//   //     "description",
//   //     "quality_cert"
//   //   ],
//   //   include: [
//   //     {
//   //       model: ProductAbstract,
//   //       required: true,
//   //       attributes: ["image", "maker", "maker_number", "stock", "type"]
//   //     }
//   //   ]
//   // })
//   //   .then(product => {
//   //     res.status(200).send(product);
//   //   })
//   //   .catch(error => {
//   //     console.log(error);
//   //     res.status(400).send(error);
//   //   });
// });

module.exports = router;
