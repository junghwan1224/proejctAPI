"use strict";
const bcrypt = require("bcryptjs");
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define(
    "account",
    {
      level: DataTypes.STRING,
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      crn: DataTypes.STRING,
      mileage: DataTypes.INTEGER,
      email: DataTypes.STRING,
      type: DataTypes.INTEGER
    },
    {
      hooks: {
        beforeCreate: (account, options) => {
          {
            // hash password before storing it into DB
            account.password =
              account.password && account.password != ""
                ? bcrypt.hashSync(account.password, 10)
                : "";

            //add uuid for id
            account.id = uuid();
          }
        },
        beforeUpdate: (account, options) => {
          // if(options.fields.includes("password")) {
          //   const { password } = account.dataValues;

          //   account.password = bcrypt.hashSync(password, 10);
          // }
        }
      }
    }
  );
  account.associate = function(models) {
    account.belongsTo(models.account_level, {
      as: "level_detail",
      foreignKey: "level",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };
  return account;
};
