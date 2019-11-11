"use strict";
module.exports = (sequelize, DataTypes) => {
  const delivery = sequelize.define(
    "delivery",
    {
      delivery_num: DataTypes.STRING,
      account_id: DataTypes.UUID,
      order_id: DataTypes.STRING,
      status: DataTypes.STRING,
      location: DataTypes.STRING,
      arrived_at: DataTypes.DATE
    },
    {}
  );
  delivery.associate = function(models) {
    // associations can be defined here
    delivery.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
    
    // delivery.belongsTo(models.order, {
    //   foreignKey: "order_id",
    //   onDelete: "cascade",
    //   onUpdate: "cascade"
    // });
  };
  return delivery;
};
