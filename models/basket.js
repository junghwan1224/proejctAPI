"use strict";
module.exports = (sequelize, DataTypes) => {
  const basket = sequelize.define(
    "basket",
    {
      account_id: DataTypes.UUID,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER.UNSIGNED
    },
    {}
  );
  basket.associate = function(models) {
    // associations can be defined here
    basket.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    basket.belongsTo(models.product, {
      foreignKey: "product_id",
      onDelete: "set null",
      onUpdate: "cascade"
    });
  };
  return basket;
};
