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
        afterBulkUpdate: (order, options) => {
          console.log(order.attributes);
          if(order.attributes.status === "paid") {
            sequelize.models.delivery.create({
              delivery_num: order.attributes.imp_uid.slice(4),
              order_id: order.attributes.imp_uid,
              status: "결제완료, 배송 준비 중",
              location: "HZY 창고",
              arrived_at: Date.now()
            }, {
              transaction: order.transaction
            });
          }
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
