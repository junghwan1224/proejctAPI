"use strict";
module.exports = (sequelize, DataTypes) => {
  const delivery = sequelize.define(
    "delivery",
    {
      delivery_num: DataTypes.STRING,
      order_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      location: DataTypes.STRING,
      arrived_at: DataTypes.DATE
    },
    {}
  );
  delivery.associate = function(models) {
    // associations can be defined here
    delivery.belongsTo(models.order, {
      foreignKey: "order_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return delivery;
};
