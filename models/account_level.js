"use strict";
module.exports = (sequelize, DataTypes) => {
  const account_level = sequelize.define(
    "account_level",
    {
      discount_rate: DataTypes.FLOAT
    },
    {}
  );

  return account_level;
};
