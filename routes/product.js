var express = require("express");
var router = express.Router();
const asyncHandler = require("express-async-handler");

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

/* OEN으로 검색: 패러미터 쿼리에 상응하는 OEN을 가진 제품 리스트 반환 */
router.get("/find-by-oen", asyncHandler(async (req, res, next) => {
  try {
    if (!req.query.oen) {
      res.status(200).send({});
      return;
    }
    const { category, oen } = req.query;
  
    const products = await Product.findAll({
      where: {
        category,
        oe_number: oen
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

    res.status(200).send(fabricated);
  }
  catch(err) {
    console.log(err);
    res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
}));

/* 부품 별 검색: 패러미터 type에 대한 제품 리스트 반환 */
router.get("/find-by-type", asyncHandler(async (req, res) => {
  try {
    const { category, type } = req.query;

        // end year
        const endQuery = keywords.reduce((acc, word) => {
          acc.push({ [Op.like]: `%${word}%` });
          return acc;
        }, []);

        const endArr = await Product.findAll({
          where: {
            end_year: { [Op.or]: endQuery }
          },
          attributes: ["id"]
        }).map(p => p.dataValues.id);

        if (endArr.length) {
          filteredId = filteredId.filter(p => endArr.indexOf(p) !== -1);
        }

        // product abstract
        const abstractQuery = keywords.reduce((acc, word) => {
          acc.push({ [Op.like]: `%${word}%` });
          return acc;
        }, []);

        const abstractArr = await Product.findAll({
          where: {
            "$product_abstract.type$": {
              [Op.or]: abstractQuery
            }
          },
          attributes: ["id"],
          include: [
            {
              model: ProductAbstract,
              required: true,
              as: "product_abstract",
              attributes: PRODUCT_ABSTRACT_ATTRIBUTES
            }
          ]
        }).map(p => p.dataValues.id);

        if (abstractArr.length) {
          filteredId = filteredId.filter(p => abstractArr.indexOf(p) !== -1);
        }

        // 필터링된 product id 값으로 상품 조회
        const filteredProducts = await Product.findAll({
          where: {
            id: { [Op.in]: filteredId },
            is_public: 1,
            category
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
        }).map(p => p.dataValues);

        // 필터링되고 남은 검색 결과가 존재하는 경우
        if (filteredProducts.length) {
          return res.status(200).send(filteredProducts);
        }

        // 필터링된 결과가 빈 배열인 경우 검색 키워드의 합집합의 결과를 보여준다.
        // ex) "bm"이란 키워드로 검색했을 때 brand에서 'bmw'를 가져오고, 다른 필드에서 해당 키워드가 포함되면
        //      겹치지 않아 필터링이 제대로 이루어지지 않는다. 이 경우, 모든 케이스 반환
        else {
          const orQuery = keywords.reduce((acc, word) => {
            acc.push({ oe_number: { [Op.like]: `%${word}%` } });
            acc.push({ brand: { [Op.like]: `%${word}%` } });
            acc.push({ model: { [Op.like]: `%${word}%` } });
            acc.push({ start_year: { [Op.like]: `%${word}%` } });
            acc.push({ end_year: { [Op.like]: `%${word}%` } });
            acc.push({
              "$product_abstract.type$": {
                [Op.like]: `%${word}%`
              }
            });
            return acc;
          }, []);

          const productsByOrQuery = await Product.findAll({
            where: {
              is_public: 1,
              [Op.or]: orQuery
            },
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

          return res.status(200).send(productsByOrQuery);
        }
      } else if (req.query.brand && req.query.category) {
        where = Object.assign(
          {
            category: req.query.category,
            is_public: 1
          },
          req.query.brand === "all"
            ? {}
            : { brand: { [Op.like]: `%${req.query.brand}%` } }
        );
      } else {
        return res.status(200).send({});
      }

      Product.findAll({
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
      })
        .then(raw_products => {
          let fabricated = {};
          for (const product of raw_products) {
            if (
              fabricated[product.oe_number] &&
              fabricated[product.oe_number].price < product.price
            ) {
              continue;
            }
            fabricated[product.oe_number] = product;
          }

          res.status(200).send(fabricated);
        })
        .catch(error => {
          console.log(error);
          res.status(400).send(error);
        });
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
    }
  })
);

// get search result filtered by category keyword
router.post("/filter", asyncHandler(async (req, res) => {
  try {
    const { year, brand, model } = req.body;

    const products = await Product.findAll({
      where: {
        brand,
        model,
        [Op.and]: [
          { start_year: { [Op.lte]: year } },
          { end_year: { [Op.gte]: year } }
        ]
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

    // send
    res.status(200).send({ products });
  }
  catch(err) {
    console.log(err);
    res.status(400).send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
  }
}));

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
        as: "product_abstract",
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
        as: "product_abstract",
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

/**
 * ARK
 */

router.post("/ark/create/product", function(req, res, next) {
  Product.create({
    abstract_id: req.body.abstract_id,
    category: req.body.category,
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

router.post("/ark/create/product-abstract", function(req, res, next) {
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

router.get("/ark/product-list", function(req, res, next) {
  Product.findAll({
    include: [
      {
        model: ProductAbstract,
        required: true,
        as: "product_abstract",
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
        as: "product_abstract",
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

router.get("/fetch-all", function(req, res, next) {
  Product.findAll({
    include: [
      {
        model: ProductAbstract,
        required: true,
        as: "product_abstract",
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
          is_public: product.is_public,
          start_year: product.start_year,
          end_year: product.end_year
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
