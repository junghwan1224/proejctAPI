"use strict";
const bcrypt = require("bcryptjs");
const uuid = require("uuid/v4");

module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define(
    "account",
    {
      phone: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      crn: DataTypes.STRING,
      mileage: DataTypes.INTEGER,
      email: DataTypes.STRING
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
        }
      }
    }
  );

  account.associate = function(models) {
    // associations can be defined here
    // account.hasMany(models.address);
    // account.hasMany(models.order);
    // account.hasMany(models.card_info);
    // account.hasMany(models.basket);
    // account.hasMany(models.favorite);
    // account.hasMany(models.sales_list);
  };
  return account;
};
