"use strict";
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define(
    "order",
    {
      date: DataTypes.DATE,
      items: DataTypes.JSON,
      vat: DataTypes.BOOLEAN,
      paid_amount: DataTypes.INTEGER,
      client_id: DataTypes.UUID,
      staff_id: DataTypes.UUID,
      foreign_info: DataTypes.JSON,
      memo: DataTypes.TEXT,
      classification: DataTypes.STRING,
      type: DataTypes.STRING,
      attachments: DataTypes.JSON,
      reference: DataTypes.JSON,
    },
    {
      hooks: {
        beforeCreate: (order, options) => {
          {
            //add uuid for id
            order.id = uuid();
          }
        },
      },
    }
  );
  order.associate = function (models) {
    order.belongsTo(models.staff, {
        foreignKey: "staff_id",
        onDelete: "set null",
        onUpdate: "cascade"
    });
  };
  return order;
};