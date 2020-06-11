"use strict";
const uuid = require("uuid/v4");
module.exports = (sequelize, DataTypes) => {
  const warehouse = sequelize.define(
    "warehouse",
    {
      name: DataTypes.STRING,
      location: DataTypes.TEXT,
      memo: DataTypes.TEXT,
    },
    {
      hooks: {
        beforeCreate: (warehouse, options) => {
          {
            warehouse.id = uuid();
          }
        }
      }
    }
  );
  warehouse.associate = function(models) {
    // associations can be defined here
  };
  return warehouse;
};
