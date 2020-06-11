"use strict";
module.exports = (sequelize, DataTypes) => {
  const account_card = sequelize.define(
    "account_card",
    {
      account_id: DataTypes.UUID,
      customer_uid: DataTypes.STRING,
      card_name: DataTypes.STRING,
      card_number: DataTypes.STRING
    },
    {}
  );
  account_card.associate = function(models) {
    // associations can be defined here
    account_card.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return account_card;
};
