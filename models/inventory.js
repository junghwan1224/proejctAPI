"use strict";
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const inventory = sequelize.define(
    "inventory",
    {
      product_id: DataTypes.UUID,
      warehouse_id: DataTypes.UUID,
      sector: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      ea_per_unit: DataTypes.INTEGER
    },
    {
      hooks: {
        beforeCreate: (inventory, options) => {
          {
            //add uuid for id
            inventory.id = uuid();
          }
        },
      },
    }
  );
  inventory.associate = function (models) {
    inventory.belongsTo(models.product, {
        foreignKey: "product_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });

    inventory.belongsTo(models.warehouse, {
        foreignKey: "warehouse_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });
  };
  return inventory;
};
