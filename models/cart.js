"use strict";
module.exports = (sequelize, DataTypes) => {
  const cart = sequelize.define(
    "cart",
    {
      account_id: DataTypes.UUID,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER.UNSIGNED
    },
    {}
  );
  cart.associate = function(models) {
    // associations can be defined here
    cart.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    cart.belongsTo(models.product, {
      foreignKey: "product_id",
      onDelete: "set null",
      onUpdate: "cascade"
    });
  };
  return cart;
};
