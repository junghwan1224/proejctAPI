"use strict";

const Product = require("../models").product;
const Account = require("../models").account;
const AccountLevel = require("../models").account_level;
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const DEV_SECRET = process.env.DEV_SECRET;

const { Op } = Sequelize;

exports.readByUser = async (req, res) => {
  const method = req.query.method || "";
  const methodMap = {
    OEN: ["oe_number"],
    CAR: ["brand", "model"],
    TYPE: ["type"]
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
  if (method.toUpperCase() == "OEN") {
    searchField.oe_number = { [Op.like]: `%${req.query.oe_number}%` };
  } else if (method.toUpperCase() == "PART") {
    searchField.type = { [Op.like]: `%${req.query.type}%` };
  } else if (method.toUpperCase() == "CAR") {
    searchField.models = {
      [Op.like]: `%${[
        req.query.brand.toUpperCase(),
        req.query.model.toUpperCase()
      ].join("$$")}%`
    };
  }

  /* Check if user is logged in, and fetch discount_rate: */
  let discount_rate = undefined;
  let total_discount_rate = parseFloat(process.env.DEFAULT_DISCOUNT);
  const { authorization } = req.headers;
  const accountId = jwt.verify(authorization, DEV_SECRET, (err, decoded) => {
    if (err) {
      return null;
    }
    return decoded.id;
  });
  if (accountId) {
    const account = await Account.findOne({
      where: {
        id: accountId
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
    discount_rate = parseFloat(account.level_detail.discount_rate);
    total_discount_rate += discount_rate;
  }

  /* Fetch products and apply discount_rate: */
  try {
    const products = await Product.findAll({
      where: searchField,
      order: [["models", "ASC"]]
    });

    for (const idx of Array(products.length).keys()) {
      /** Calculate according to the discount rate: */
      if (discount_rate === undefined)
        products[idx].price *= 1 + parseFloat(process.env.DEFAULT_DISCOUNT);
      else {
        /** Update price: */
        products[idx].price =
          Math.round((products[idx].price * (1 - discount_rate)) / 10) * 10;

        /* Add originalPrice: */
        products[idx].setDataValue(
          "originalPrice",
          Math.round((products[idx].price * (1 + total_discount_rate)) / 10) *
            10
        );

        /* Add discount_rate: */
        products[idx].setDataValue(
          "discount_rate",
          (products[idx].discount_rate = Math.round(total_discount_rate * 100))
        );
      }
    }
    return res.status(200).send(products);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "에러가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

// exports.readByUser = async (req, res) => {
//   const method = req.query.method || "";

//   if (method.toUpperCase() === "MAKER") {
//     // req.query.year 옵션은 없어도 되기에 필요한 기초 정보로 두지 않는다.
//     if (!(req.query.category && req.query.oe_number)) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     const whereQuery = {
//       category: req.query.category,
//       oe_number: req.query.oe_number,
//       is_public: true
//     };

//     // 연도 옵션이 존재할 시 쿼리 조건에 추가
//     if (req.query.year) {
//       Object.assign(whereQuery, { start_year: { [Op.lte]: req.query.year } });
//       Object.assign(whereQuery, { end_year: { [Op.gte]: req.query.year } });
//     }

//     try {
//       const products = await Product.findAll({
//         where: whereQuery,
//         order: [
//           ["brand", "ASC"],
//           ["model", "ASC"]
//         ]
//       });

//       return res.status(200).send(products);
//     } catch (err) {
//       console.log(err);
//       return res
//         .status(400)
//         .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
//     }
//   }

//   /* Search Method: */
//   let where = {};
//   if (method.toUpperCase() === "CAR") {
//     /* 차량별 검색 : 패러미터 category, year,brand,model에 대한 제품 리스트 반환 */
//     if (
//       !(
//         req.query.category &&
//         req.query.year &&
//         req.query.brand &&
//         req.query.model
//       )
//     ) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     where = {
//       category: req.query.category,
//       brand: req.query.brand,
//       model: req.query.model,
//       is_public: true,
//       [Op.and]: [
//         { start_year: { [Op.lte]: req.query.year } },
//         { end_year: { [Op.gte]: req.query.year } }
//       ]
//     };
//   } else if (method.toUpperCase() === "TYPE") {
//     /* 부품 별 검색: 패러미터 type에 대한 제품 리스트 반환 */
//     if (!(req.query.category && req.query.type)) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     where = {
//       is_public: true,
//       category: req.query.category,
//       type: { [Op.like]: `%${req.query.type}%` }
//     };
//   } else if (method.toUpperCase() === "OEN") {
//     /* OEN으로 검색: 패러미터 쿼리에 상응하는 OEN을 가진 제품 리스트 반환 */
//     if (!(req.query.category && req.query.oe_number)) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     where = {
//       is_public: true,
//       category: req.query.category,
//       oe_number: { [Op.like]: `%${req.query.oe_number}%` }
//     };
//   } else {
//     return res.status(400).send({ message: "method 값이 유효하지 않습니다." });
//   }

//   try {
//     const products = await Product.findAll({
//       where: where,
//       order: [
//         ["brand", "ASC"],
//         ["model", "ASC"]
//       ]
//     }).map(p => p.dataValues);

//     let fabricated = {};
//     for (const product of products) {
//       if (
//         fabricated[product.oe_number] &&
//         fabricated[product.oe_number].price < product.price
//       ) {
//         continue;
//       }
//       fabricated[product.oe_number] = product;
//     }

//     return res.status(200).send(fabricated);
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
//   }
// };

// exports.readByAdmin = async (req, res) => {
//   const method = req.query.method || "";

//   if (method.toUpperCase() === "ALL") {
//     try {
//       const products = await Product.findAll({
//         order: [
//           ["brand", "ASC"],
//           ["model", "ASC"]
//         ]
//       });

//       return res.status(200).send(products);
//     } catch (err) {
//       return res
//         .status(400)
//         .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
//     }
//   }

//   if (method.toUpperCase() === "MAKER") {
//     if (!(req.query.category && req.query.oe_number)) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     try {
//       const products = await Product.findAll({
//         where: {
//           category: req.query.category,
//           oe_number: req.query.oe_number,
//           is_public: true
//         },
//         order: [
//           ["brand", "ASC"],
//           ["model", "ASC"]
//         ]
//       });

//       return res.status(200).send(products);
//     } catch (err) {
//       return res
//         .status(400)
//         .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
//     }
//   }

//   /* Search Method: */
//   let where = {};
//   if (method.toUpperCase() === "CAR") {
//     /* 차량별 검색 : 패러미터 category, year,brand,model에 대한 제품 리스트 반환 */
//     if (
//       !(
//         req.query.category &&
//         req.query.year &&
//         req.query.brand &&
//         req.query.model
//       )
//     ) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     where = {
//       category: req.query.category,
//       brand: req.query.brand,
//       model: req.query.model,
//       is_public: true,
//       [Op.and]: [
//         { start_year: { [Op.lte]: req.query.year } },
//         { end_year: { [Op.gte]: req.query.year } }
//       ]
//     };
//   } else if (method.toUpperCase() === "TYPE") {
//     /* 부품 별 검색: 패러미터 type에 대한 제품 리스트 반환 */
//     if (!(req.query.category && req.query.type)) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     where = {
//       is_public: true,
//       category: req.query.category,
//       type: { [Op.like]: `%${req.query.type}%` }
//     };
//   } else if (method.toUpperCase() === "OEN") {
//     /* OEN으로 검색: 패러미터 쿼리에 상응하는 OEN을 가진 제품 리스트 반환 */
//     if (!(req.query.category && req.query.oe_number)) {
//       return res
//         .status(400)
//         .send({ message: "필요한 정보를 모두 입력해주세요." });
//     }
//     where = {
//       is_public: true,
//       category: req.query.category,
//       oe_number: { [Op.like]: `%${req.query.oe_number}%` }
//     };
//   } else {
//     return res.status(400).send({ message: "method 값이 유효하지 않습니다." });
//   }

//   try {
//     const products = await Product.findAll({
//       where: where,
//       order: [
//         ["brand", "ASC"],
//         ["model", "ASC"]
//       ]
//     }).map(p => p.dataValues);

//     let fabricated = {};
//     for (const product of products) {
//       if (
//         fabricated[product.oe_number] &&
//         fabricated[product.oe_number].price < product.price
//       ) {
//         continue;
//       }
//       fabricated[product.oe_number] = product;
//     }

//     return res.status(200).send(fabricated);
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .send({ message: "에러가 발생했습니다. 다시 시도해주세요." });
//   }
// };
