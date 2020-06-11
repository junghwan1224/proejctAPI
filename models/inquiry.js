"use strict";
module.exports = (sequelize, DataTypes) => {
  const inquiry = sequelize.define(
    "inquiry",
    {
      account_id: DataTypes.UUID,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      type: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      status: DataTypes.STRING,
      attachment: DataTypes.TEXT,
      staff_id: DataTypes.UUID
    },
    {}
  );
  inquiry.associate = function(models) {
    // associations can be defined here
    inquiry.belongsTo(models.account, {
      foreignKey: "account_id",
      onDelete: "set null",
      onUpdate: "cascade"
    });

    inquiry.belongsTo(models.staff, {
      foreignKey: "staff_id",
      onDelete: "set null",
      onUpdate: "cascade"
    });
  };
  return inquiry;
};
