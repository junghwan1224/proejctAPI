"use strict";
module.exports = (sequelize, DataTypes) => {
  const sales_list = sequelize.define(
    "sales_list",
    {
      parts_id: DataTypes.INTEGER,
      krw_price: DataTypes.INTEGER,
      foreign_price: DataTypes.INTEGER,
      foreign_currency: DataTypes.STRING,
      date: DataTypes.DATE,
      buyer: DataTypes.UUID,
      state: DataTypes.STRING
    },
    {}
  );
  sales_list.associate = function(models) {
    // associations can be defined here
    sales_list.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    sales_list.belongsTo(models.product, {
      foreignKey: "parts_id",
      onDelete: "set null",
      onUpdate: "cascade"
    });
  };
  return sales_list;
};
