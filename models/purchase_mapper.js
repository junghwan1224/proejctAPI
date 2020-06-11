"use strict";


module.exports = (sequelize, DataTypes) => {
  const puchase_mapper = sequelize.define(
    "domestic_purchase",
    {
        staff_id: DataTypes.UUID,
        supplier_id: DataTypes.UUID,
        date: DataTypes.DATE,
        verified: DataTypes.BOOLEAN,
        memo: DataTypes.TEXT
    },
    {
        hooks: {}
    }
  );
  puchase_mapper.associate = function(models) {
    // associations can be defined here
    puchase_mapper.belongsTo(models.supplier, {
      foreignKey: "supplier_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    puchase_mapper.belongsTo(models.staff, {
        foreignKey: "staff_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });
  };

  return puchase_mapper;
};
