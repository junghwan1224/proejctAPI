"use strict";
const uuid = require("uuid/v4");
module.exports = (sequelize, DataTypes) => {
  const product_abstract = sequelize.define(
    "product_abstract",
    {
      image: DataTypes.STRING, // 제품 자체의 img url
      maker: DataTypes.STRING, // 메이커, 제조공장, e.g. KOYO, NSK
      maker_number: DataTypes.STRING,
      stock: DataTypes.INTEGER, // 재고
      type: DataTypes.STRING // e.g. 허브베어링
    },
    {
      hooks: {
        beforeCreate: (account, options) => {
          {
            account.id = uuid();
          }
        }
      }
    }
  );
  product_abstract.associate = function(models) {
    // associations can be defined here
    // product_abstract.hasMany(models.sales_list);
    // product_abstract.hasMany(models.purchase_list);
    // product_abstract.hasMany(models.product);
  };
  return product_abstract;
};
