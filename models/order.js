"use strict";

const Op = require("sequelize").Op;

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
        afterBulkCreate: async (instances, options) => {
          const { account_id, merchant_uid, status } = instances[0].dataValues;
          const {
            shipping_postcode,
            shipping_primary,
            shipping_detail
          } = options;

          if(status === "credit not paid") {
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

            // 외상거래 수정 시 배송 테이블에 계속 새로 추가되는 이슈 해결 코드
            // 주문 id(merchant_uid)에 대해 같은 행이 2개 이상인 경우 제일 먼저 추가된 행을 삭제
            const deliveryCount = await sequelize.models.delivery.count({
              where: { order_id: merchant_uid },
              transaction: options.transaction
            });

            if(deliveryCount >= 2) {
              await sequelize.models.delivery.destroy({
                where: { order_id: merchant_uid },
                limit: 1,
                transaction: options.transaction
              });
            }
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
