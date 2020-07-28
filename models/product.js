import uuid from "uuid";

export default (sequelize, DataTypes) => {
  const product = sequelize.define(
    "product",
    {
      name: DataTypes.STRING,
      unit: DataTypes.STRING,
      specification: DataTypes.STRING,
      type: DataTypes.STRING,
      price_a: DataTypes.INTEGER,
      price_b: DataTypes.INTEGER,
      price_c: DataTypes.INTEGER,
      price_d: DataTypes.INTEGER,
      price_e: DataTypes.INTEGER,
      essential_stock: DataTypes.INTEGER,
      memo: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      hooks: {
        beforeCreate: (product, options) => {
          {
            //add uuid for id
            product.id = uuid.v4();
          }
        },
      },
    }
  );
  product.associate = function (models) {};
  return product;
};
