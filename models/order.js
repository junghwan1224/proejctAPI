"use strict";
module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define(
    "order",
    {
      merchant_uid: DataTypes.STRING,
      imp_uid: DataTypes.STRING,
      account_id: DataTypes.UUID,
      product_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER.UNSIGNED,
      pay_method: DataTypes.STRING,
      status: DataTypes.STRING,
      memo: DataTypes.STRING
    },
    {
      hooks: {
        afterCreate: (order, options) => {
          sequelize.models.delivery.create({
            delivery_num: options.delivery_num,
            order_id: order.id,
            status: options.status,
            location: options.location,
            arrived_at: Date.now()
          });
        }
      }
    }
  );
  order.associate = function(models) {
    // associations can be defined here
    order.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    order.belongsTo(models.product, {
      foreignKey: "product_id",
      onDelete: "set null",
      onUpdate: "cascade"
    });

    order.hasOne(models.delivery);
  };
  return order;
};
