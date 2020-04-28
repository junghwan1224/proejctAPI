"use strict";
module.exports = (sequelize, DataTypes) => {
  const favorite = sequelize.define(
    "favorite",
    {
      account_id: DataTypes.UUID,
      product_id: DataTypes.INTEGER
    },
    {}
  );
  favorite.associate = function(models) {
    // associations can be defined here
    favorite.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade"
    });
    favorite.belongsTo(models.product, {
      foreignKey: "product_id",
      onDelete: "set null"
    });
  };
  return favorite;
};
