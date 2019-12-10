var express = require("express");
var router = express.Router();
const asyncHandler = require('express-async-handler');

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

router.get("/find-by-oen", function(req, res, next) {
  if (!req.query.oen) {
    res.status(200).send({});
    return;
  }

  Product.findAll({
    where: {
      oe_number: req.query.oen
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
    .then(products => {
      res.status(200).send(products);
    })
    .catch(error => {
      res.status(400).send();
    });
});

router.get("/unique-oen", asyncHandler(async (req, res, next) => {
  try{
    let where;
    if (req.query.query) {
      const { category, brand, query } = req.query;
      /*
        각각의 배열들을 갖고 product 테이블에서 값 findAll
        조회된 값이 없을 시([]) pass
        조회된 값이 있는 항목들 끼리 비교 후 공통된 값들 필터링 
      */

      // 검색 키워드를 공백과 , 기준으로 분리
      const keywords = query.split(/(?:,| )+/);

      // 추후 필터링에 이용할 product id 값을 담고있는 배열, 초기에는 모두 가져온다.
      let filteredId = await Product.findAll({ attributes: ["id"] }).map(p => p.dataValues.id);

      // oe number
      // 공백과 , 로 분리된 키워드 하나하나로 like 쿼리문 배열 반환
      const oeQuery = keywords.reduce((acc, word) => {
        acc.push({ [Op.like]: `%${word}%` });
        return acc;
      }, []);

      // 반환된 배열을 통해 해당 product id 값 추출
      const oeArr = await Product.findAll({
        where: {
          oe_number: { [Op.or]: oeQuery }
        },
        attributes: ["id"]
      }).map(p => p.dataValues.id);

      // 반환된 배열에 값이 하나라도 존재할 시 필터링
      if(oeArr.length) {
        filteredId = filteredId.filter(p => oeArr.indexOf(p) !== -1);
      }

      // brand
      // brand 값이 "all" 인 경우: 브랜드 선택을 안했으므로, brand 필드에 검색 키워드 적용
      if(brand === "all") {
        const brandQuery = keywords.reduce((acc, word) => {
          acc.push({ [Op.like]: `%${word}%` });
          return acc;
        }, []);
  
        const brandArr = await Product.findAll({
          where: {
            brand: { [Op.or]: brandQuery }
          },
          attributes: ["id"]
        }).map(p => p.dataValues.id);
  
        if(brandArr.length) {
          filteredId = filteredId.filter(p => brandArr.indexOf(p) !== -1);
        }
      }

      // model
      const modelQuery = keywords.reduce((acc, word) => {
        acc.push({ [Op.like]: `%${word}%` });
        return acc;
      }, []);

      const modelArr = await Product.findAll({
        where: {
          model: { [Op.or]: modelQuery }
        },
        attributes: ["id"]
      }).map(p => p.dataValues.id);

      if(modelArr.length) {
        filteredId = filteredId.filter(p => modelArr.indexOf(p) !== -1);
      }

      // start year
      const startQuery = keywords.reduce((acc, word) => {
        acc.push({ [Op.like]: `%${word}%` });
        return acc;
      }, []);

      const startArr = await Product.findAll({
        where: {
          start_year: { [Op.or]: startQuery }
        },
        attributes: ["id"]
      }).map(p => p.dataValues.id);

      if(startArr.length) {
        filteredId = filteredId.filter(p => startArr.indexOf(p) !== -1);
      }

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

      if(endArr.length) {
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
          },
        },
        attributes: ["id"],
        include: [
          {
            model: ProductAbstract,
            required: true,
            attributes: PRODUCT_ABSTRACT_ATTRIBUTES
          }
        ],
      }).map(p => p.dataValues.id);

      if(abstractArr.length) {
        filteredId = filteredId.filter(p => abstractArr.indexOf(p) !== -1);
      }

      // 필터링된 product id 값으로 상품 조회
      const filteredProducts = await Product.findAll({
        where: {
          id: { [Op.in]: filteredId },
          is_public: 1,
          category,
          // 브랜드 선택이 안돼있을 시, 전체를 가져옴
          brand: brand === "all" ? { [Op.not]: "all" } : { [Op.like]: `%${brand}%` }
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
      }).map(p => p.dataValues);

      if(filteredProducts.length) {
        return res.status(200).send(filteredProducts);
      }
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

        const allProductsByQuery = await Product.findAll({
          where: {
            is_public: 1,
            [Op.or]: orQuery
          },
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
        });

        return res.status(200).send(allProductsByQuery);
      }

    } else if (req.query.brand && req.query.category) {
      where = Object.assign(
        {
          category: req.query.category,
          is_public: 1
        },
        req.query.brand === "all" ? {} : { brand: { [Op.like]: `%${req.query.brand}%` } }
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
