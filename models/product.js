"use strict";
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    "product",
    {
      abstract_id: DataTypes.INTEGER,
      brand: DataTypes.STRING, // e.g. BMW
      model: DataTypes.STRING, // e.g. E-CLASS
      oe_number: DataTypes.STRING, // e.g. A12345
      start_year: DataTypes.INTEGER.UNSIGNED, // e.g. 2010
      end_year: DataTypes.INTEGER.UNSIGNED, // e.g. 2019,
      engine: DataTypes.STRING // e.g. 엔진타입, G2.0
    },
    {}
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
