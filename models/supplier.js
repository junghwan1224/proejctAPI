"use strict";
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const supplier = sequelize.define(
    "supplier",
    {
      address: DataTypes.TEXT,
      crn: DataTypes.STRING,
      name: DataTypes.STRING,
      poc: DataTypes.STRING,
      fax: DataTypes.STRING,
      alias: DataTypes.STRING,
      worker: DataTypes.STRING,
      worker_poc: DataTypes.STRING,
      memo: DataTypes.TEXT,
    },
    {
      hooks: {
        beforeCreate: (admin, options) => {
          {
            admin.id = uuid();
          }
        },
      },
    }
  );
  supplier.associate = function (models) {};
  return supplier;
};
