"use strict";
module.exports = (sequelize, DataTypes) => {
  const card_info = sequelize.define(
    "card_info",
    {
      account_id: DataTypes.UUID,
      customer_uid: DataTypes.STRING,
      card_name: DataTypes.STRING,
      card_number: DataTypes.STRING
    },
    {}
  );
  card_info.associate = function(models) {
    // associations can be defined here
    card_info.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return card_info;
};
