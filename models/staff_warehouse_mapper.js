"use strict";
const uuid = require("uuid/v4");
module.exports = (sequelize, DataTypes) => {
  const staff_warehouse_mapper = sequelize.define(
    "warehouse",
    {
      staff_id: DataTypes.UUID,
      warehouse_id: DataTypes.UUID,
      product_id: DataTypes.UUID,
      quantity: DataTypes.INTEGER,
    },
    {
      hooks: {
        beforeCreate: (staff_warehouse_mapper, options) => {
          {
            staff_warehouse_mapper.id = uuid();
          }
        }
      }
    }
  );
  staff_warehouse_mapper.associate = function(models) {
    // associations can be defined here
    staff_warehouse_mapper.belongsTo(models.staff, {
        foreignKey: "staff_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });

    staff_warehouse_mapper.belongsTo(models.warehouse, {
        foreignKey: "warehouse_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });

    staff_warehouse_mapper.belongsTo(models.product, {
        foreignKey: "product_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });
  };
  return staff_warehouse_mapper;
};
