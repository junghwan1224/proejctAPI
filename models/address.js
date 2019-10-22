"use strict";
module.exports = (sequelize, DataTypes) => {
  const address = sequelize.define(
    "address",
    {
      account_id: DataTypes.UUID,
      postcode: DataTypes.STRING,
      primary: DataTypes.STRING,
      detail: DataTypes.STRING
    },
    {}
  );
  address.associate = function(models) {
    // associations can be defined here
    address.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return address;
};
