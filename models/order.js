import uuid from "uuid";

export default (sequelize, DataTypes) => {
  const order = sequelize.define(
    "order",
    {
      date: DataTypes.DATE,
      items: DataTypes.JSON,
      vat: DataTypes.BOOLEAN,
      paid_amount: DataTypes.INTEGER,
      client_id: DataTypes.STRING,
      staff_id: DataTypes.STRING,
      foreign_info: DataTypes.JSON,
      memo: DataTypes.STRING,
      classification: DataTypes.STRING,
      type: DataTypes.STRING,
      attachments: DataTypes.JSON,
      reference: DataTypes.JSON,
    },
    {
      hooks: {
        beforeCreate: (order, options) => {
          //add uuid for id
          order.id = uuid.v4();

          // add default json value if field does not exist
          order.items = order.dataValues.items ? order.dataValues.items : {};
          order.foreign_info = order.dataValues.foreign_info ? order.dataValues.foreign_info : {};
          order.attachments = order.dataValues.attachments ? order.dataValues.attachments : {};
          order.reference = order.dataValues.reference ? order.dataValues.reference : {};
        },
      },
    }
  );
  order.associate = function (models) {
    order.belongsTo(models.staff, {
      foreignKey: "staff_id",
      onDelete: "set null",
      onUpdate: "cascade",
    });
  };
  return order;
};
