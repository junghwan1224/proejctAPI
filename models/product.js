"use strict";
const uuid = require("uuid/v4");
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    "product",
    {
      images: DataTypes.TEXT, // concat: ","
      maker: DataTypes.STRING, // 메이커, 제조공장, e.g. KOYO, NSK
      maker_number: DataTypes.STRING,
      stock: DataTypes.INTEGER, // 재고
      allow_discount: DataTypes.BOOLEAN,
      price: DataTypes.INTEGER,
      models: DataTypes.TEXT, // BRAND+MODEL+START_YEAR+END_YEAR+ENGINE
      oe_number: DataTypes.STRING, // e.g. A12345
      quality_cert: DataTypes.STRING, // 품질인증 e.g. KAPA (한국자동차부품협회),
      maker_origin: DataTypes.STRING, // e.g. 중국, 일본, 독일
      memo: DataTypes.TEXT, // e.g. 제품에 대한 전산 상의 메모
      description_images: DataTypes.STRING, // 제품 설명 URL 이미지
      is_public: DataTypes.BOOLEAN,
      type: DataTypes.STRING, // e.g. 허브베어링
      attributes: DataTypes.STRING, // e.g. 소모부품,승용차,하체부품
      tags: DataTypes.STRING, // 매진임박, 할인 등등
      optional: DataTypes.TEXT, // 특정 제품들에만 쓰이는 필드가 생겼을 때, 동적으로 옵셔널하게 필드를 추가할 때 쓰는 필드
      ea_per_box: DataTypes.INTEGER // 박스 1개당 제품이 몇개가 들어가는지에 대한 값
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
  };
  return product;
};
