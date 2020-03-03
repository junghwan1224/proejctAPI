"use strict";
module.exports = (sequelize, DataTypes) => {
  const purchase_list = sequelize.define(
    "purchase_list",
    {
      parts_id: DataTypes.INTEGER,
      krw_price: DataTypes.INTEGER,
      foreign_price: DataTypes.INTEGER,
      foreign_currency: DataTypes.STRING,
      date: DataTypes.DATE,
      seller: DataTypes.STRING,
      state: DataTypes.STRING
    },
    {}
  );
  purchase_list.associate = function(models) {
    // associations can be defined here
    purchase_list.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    purchase_list.belongsTo(models.product, {
      foreignKey: "parts_id",
      onDelete: "set null",
      onUpdate: "cascade"
    });
  };
  return purchase_list;
};
