"use strict";
module.exports = (sequelize, DataTypes) => {
  const account_levels = sequelize.define(
    "account_levels",
    {
      name: DataTypes.STRING,
      discount_rate: DataTypes.FLOAT
    },
    {}
  );
  account_levels.associate = function(models) {
    // associations can be defined here
    account_levels.hasMany(models.account, {
      as: "account_level_name",
      foreignKey: "name"
    });
  };

  return account_levels;
};
