"use strict";
module.exports = (sequelize, DataTypes) => {
  const article = sequelize.define(
    "article",
    {
      title: DataTypes.STRING,
      type: DataTypes.STRING,
      contents: DataTypes.TEXT,
      date: DataTypes.DATEONLY
    },
    {}
  );
  article.associate = function(models) {
    // associations can be defined here
  };
  return article;
};
