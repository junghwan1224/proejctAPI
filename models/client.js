import uuid from "uuid";

export default (sequelize, DataTypes) => {
  const client = sequelize.define(
    "client",
    {
      name: DataTypes.STRING,
      crn: DataTypes.STRING,
      business_type: DataTypes.STRING,
      business_item: DataTypes.STRING,
      representative: DataTypes.STRING,
      poc1: DataTypes.STRING,
      poc2: DataTypes.STRING,
      ƒax: DataTypes.STRING,
      worker: DataTypes.STRING,
      worker_email: DataTypes.STRING,
      worker_poc: DataTypes.STRING,
      staff_id: DataTypes.STRING,
      default_price_type: DataTypes.STRING,
      postcode: DataTypes.STRING,
      address: DataTypes.STRING,
      trade_type: DataTypes.STRING,
      memo: DataTypes.TEXT,
    },
    {
      hooks: {
        beforeCreate: (client, options) => {
          {
            //add uuid for id
            client.id = uuid.v4();
          }
        },
      },
    }
  );
  client.associate = function (models) {
    client.belongsTo(models.staff, {
      foreignKey: "staff_id",
      onDelete: "set null",
      onUpdate: "cascade",
    });
  };
  return client;
};
