"use strict";
const uuid = require("uuid/v4");
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    "product",
    {
      images: DataTypes.STRING, // concat: "||"
      maker: DataTypes.STRING, // 메이커, 제조공장, e.g. KOYO, NSK
      maker_number: DataTypes.STRING,
      stock: DataTypes.INTEGER, // 재고
      allow_discount: DataTypes.BOOLEAN,
      price: DataTypes.INTEGER,
      brand: DataTypes.STRING, // e.g. BMW
      model: DataTypes.STRING, // e.g. E-CLASS
      oe_number: DataTypes.STRING, // e.g. A12345
      start_year: DataTypes.INTEGER.UNSIGNED, // e.g. 2010
      end_year: DataTypes.INTEGER.UNSIGNED, // e.g. 2019,
      engine: DataTypes.STRING, // e.g. 엔진타입, G2.0
      quality_cert: DataTypes.STRING, // 품질인증 e.g. KAPA (한국자동차부품협회),
      maker_origin: DataTypes.STRING, // e.g. 중국, 일본, 독일
      memo: DataTypes.TEXT, // e.g. 제품에 대한 전산 상의 메모
      description_images: DataTypes.STRING, // 제품 설명 URL 이미지
      is_public: DataTypes.BOOLEAN,
      type: DataTypes.STRING, // e.g. 허브베어링
      attributes: DataTypes.STRING, // e.g. 소모부품,하체부품
      classification: DataTypes.STRING, // e.g. car vs com vs agr
      optional: DataTypes.TEXT
    },
    {
      hooks: {
        beforeCreate: (product, options) => {
          {
            product.id = uuid();
          }
        }
      }
    }
  );
  product.associate = function(models) {
    // associations can be defined here
    // product.hasOne(models.order);
    // product.hasOne(models.basket);
    // product.hasOne(models.favorite);

    product.belongsTo(models.product_abstract, {
      as: "product_abstract",
      foreignKey: "abstract_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return product;
};
