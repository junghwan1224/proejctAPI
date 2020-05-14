"use strict";


module.exports = (sequelize, DataTypes) => {
  const domestic_purchase = sequelize.define(
    "domestic_purchase",
    {
        supplier_id: DataTypes.UUID,
        product_id: DataTypes.UUID,
        staff_id: DataTypes.UUID,
        quantity: DataTypes.INTEGER,
        price: DataTypes.INTEGER,
    },
    {
        hooks: {
            afterCreate: async (instance, options) => {
               const { product_id, quantity } = instance.dataValues;
               const { transaction } = options;
               const product = await sequelize.models.product.findOne({
                   where: { id: product_id },
                   attributes: ["stock"],
                   transaction
               });

               await sequelize.models.product.update({
                   stock: product.dataValues.stock + parseInt(quantity)
               }, {
                   where: { id: product_id },
                   transaction
               });
            },
            afterUpdate: async (instance, options) => {
               const { fields, productId, prevQuantity, transaction } = options;

               if(fields.indexOf("quantity") !== -1) {
                    const product = await sequelize.models.product.findOne({
                        where: { id: productId },
                        attributes: ["stock"],
                        transaction
                    });

                    await sequelize.models.product.update({
                        stock: product.dataValues.stock - parseInt(prevQuantity) + parseInt(instance.dataValues.quantity)
                    }, {
                        where: { id: productId },
                        transaction
                    });
               }
            }
        }
    }
  );
  domestic_purchase.associate = function(models) {
    // associations can be defined here
    domestic_purchase.belongsTo(models.supplier, {
      foreignKey: "supplier_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    domestic_purchase.belongsTo(models.product, {
      foreignKey: "product_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    domestic_purchase.belongsTo(models.staff, {
        foreignKey: "staff_id",
        onDelete: "cascade",
        onUpdate: "cascade"
    });
  };

  return domestic_purchase;
};
