"use strict";
module.exports = (sequelize, DataTypes) => {
  const account_address = sequelize.define(
    "account_address",
    {
      account_id: DataTypes.UUID,
      postcode: DataTypes.STRING,
      primary: DataTypes.STRING,
      detail: DataTypes.STRING
    },
    {}
  );
  account_address.associate = function(models) {
    // associations can be defined here
    account_address.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return account_address;
};
