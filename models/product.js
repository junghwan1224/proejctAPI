"use strict";
const uuid = require("uuid/v4");
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    "product",
    {
      abstract_id: DataTypes.UUID,
      category: DataTypes.STRING, // e.g. car vs com vs agr
      brand: DataTypes.STRING, // e.g. BMW
      model: DataTypes.STRING, // e.g. E-CLASS
      oe_number: DataTypes.STRING, // e.g. A12345
      start_year: DataTypes.INTEGER.UNSIGNED, // e.g. 2010
      end_year: DataTypes.INTEGER.UNSIGNED, // e.g. 2019,
      engine: DataTypes.STRING, // e.g. 엔진타입, G2.0
      price: DataTypes.INTEGER,
      discount_rate: DataTypes.FLOAT,
      memo: DataTypes.TEXT, // e.g. 제품에 대한 전산 상의 메모
      description: DataTypes.STRING, // 제품 설명 URL 이미지
      quality_cert: DataTypes.STRING, //  품질인증 e.g. KAPA (한국자동차부품협회),
      is_public: DataTypes.BOOLEAN
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
      foreignKey: "abstract_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return product;
};
