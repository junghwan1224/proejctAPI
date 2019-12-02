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
        afterBulkUpdate: function(options) {
          if(options.attributes.status === "paid") {
            sequelize.models.delivery.create({
              account_id: options.attributes.account_id,
              delivery_num: options.attributes.merchant_uid.slice(13),
              order_id: options.attributes.merchant_uid,
              status: "결제완료, 배송 준비 중",
              location: "HZY 창고",
              arrived_at: Date.now()
            }, {
              transaction: options.transaction
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

    // order.hasOne(models.delivery);
  };
  return order;
};
