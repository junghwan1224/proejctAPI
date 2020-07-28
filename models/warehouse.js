import uuid from "uuid";

export default (sequelize, DataTypes) => {
  const warehouse = sequelize.define(
    "warehouse",
    {
      name: DataTypes.STRING,
      location: DataTypes.STRING,
      memo: DataTypes.STRING,
    },
    {
      hooks: {
        beforeCreate: (warehouse, options) => {
          {
            warehouse.id = uuid.v4();
          }
        },
      },
    }
  );
  warehouse.associate = function (models) {
    // associations can be defined here
  };
  return warehouse;
};
