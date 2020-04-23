"use strict";
module.exports = (sequelize, DataTypes) => {
  const inquiry = sequelize.define(
    "inquiry",
    {
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      type: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      attachment: DataTypes.TEXT
    },
    {}
  );
  inquiry.associate = function(models) {
    // associations can be defined here
  };
  return inquiry;
};
