"use strict";
module.exports = (sequelize, DataTypes) => {
  const product_abstract = sequelize.define(
    "product_abstract",
    {
      element: DataTypes.UUID, // 부품에 대한 고유 ID
      price: DataTypes.INTEGER,
      discount_rate: DataTypes.FLOAT,
      stock: DataTypes.INTEGER, // 재고
      maker: DataTypes.STRING, // 메이커, 제조공장, e.g. KOYO, NSK
      image: DataTypes.STRING, // img url
      type: DataTypes.STRING, // e.g. 허브베어링
      description: DataTypes.STRING, // e.g. 제품에 대한 전산 상의 메모
      quality_cert: DataTypes.STRING //  품질인증 e.g. KAPA (한국자동차부품협회)
    },
    {}
  );
  product_abstract.associate = function(models) {
    // associations can be defined here
    product_abstract.hasMany(models.sales_list);
    product_abstract.hasMany(models.purchase_list);
    // product_abstract.hasMany(models.product);
  };
  return product_abstract;
};
