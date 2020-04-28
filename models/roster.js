"use strict";
module.exports = (sequelize, DataTypes) => {
  const roster = sequelize.define(
    "roster",
    {
      departure: DataTypes.DATE,
      arrival: DataTypes.DATE
    },
    {}
  );
  roster.associate = function(models) {
    // associations can be defined here
  };
  return roster;
};
