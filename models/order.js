"use strict";

module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define(
    "order",
    {
      merchant_uid: DataTypes.STRING,
      imp_uid: DataTypes.STRING,
      account_id: DataTypes.UUID,
      product_id: DataTypes.UUID,
      name: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      mileage: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER.UNSIGNED,
      pay_method: DataTypes.STRING,
      status: DataTypes.STRING,
      memo: DataTypes.STRING,
      paidAt: DataTypes.STRING
    },
    {
      hooks: {
        afterBulkUpdate: async options => {
          if(options.attributes.status === "paid") {
            const {
              account_id,
              merchant_uid,
              shipping_postcode,
              shipping_primary,
              shipping_detail
            } = options;

            await sequelize.models.delivery.create({
              account_id,
              delivery_num: merchant_uid.slice(7),
              order_id: merchant_uid,
              status: "결제완료, 배송 준비 중",
              location: "HZY 창고",
              shipping_postcode,
              shipping_primary,
              shipping_detail,
            }, {
              transaction: options.transaction
            });
          }
        },
        afterBulkCreate: async (instances, options) => {}
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
