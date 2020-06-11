"use strict";
const uuid = require("uuid/v4");
module.exports = (sequelize, DataTypes) => {
  const warehouse_mapper = sequelize.define(
    "warehouse",
    {
      warehouse_id: DataTypes.UUID,
      product_id: DataTypes.UUID,
      quantity: DataTypes.INTEGER,
    },
    {
      hooks: {
        beforeCreate: (warehouse_mapper, options) => {
          {
            warehouse_mapper.id = uuid();
          }
        }
      }
    }
  );
  warehouse_mapper.associate = function(models) {
    // associations can be defined here
    warehouse_mapper.belongsTo(models.warehouse, {
        foreignKey: "warehouse_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });

    warehouse_mapper.belongsTo(models.product, {
        foreignKey: "product_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });
  };
  return warehouse_mapper;
};
