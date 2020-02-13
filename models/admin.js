"use strict";
const bcrypt = require("bcryptjs");
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const admin = sequelize.define(
    "admin",
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      code: DataTypes.STRING
    },
    {
      hooks: {
        beforeCreate: (admin, options) => {
          {
            // hash password before storing it into DB
            admin.password =
              admin.password && admin.password != ""
                ? bcrypt.hashSync(admin.password, 10)
                : "";

            //add uuid for id
            admin.id = uuid();
          }
        }
      }
    }
  );
  admin.associate = function(models) {};
  return admin;
};
