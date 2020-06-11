"use strict";


module.exports = (sequelize, DataTypes) => {
  const domestic_purchase = sequelize.define(
    "domestic_purchase",
    {
        mapper_id: DataTypes.UUID,
        product_id: DataTypes.UUID,
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
               const { product_id: nextProductId, quantity: nextQuantity } = instance.dataValues;
               const { fields, productId: prevProductId, prevQuantity, transaction } = options;

               // 제품과 수량 둘 다 변경하는 경우 
               if(fields.indexOf("product_id") !== -1 && fields.indexOf("quantity") !== -1) {
                  const prevProduct = await sequelize.models.product.findOne({ where: { id: prevProductId } });
                  const nextProduct = await sequelize.models.product.findOne({ where: { id: nextProductId } });

                  // prev product
                  await sequelize.models.product.update({
                    stock: prevProduct.dataValues.stock - parseInt(prevQuantity)
                  }, {
                    where: { id: prevProductId },
                    transaction
                  });

                  // next product
                  await sequelize.models.product.update({
                    stock: nextProduct.dataValues.stock + parseInt(nextQuantity)
                  }, {
                    where: { id: nextProductId },
                    transaction
                  });
               }

              //  제품만 변경하는 경우
               else if(fields.indexOf("product_id") !== -1 && fields.indexOf("quantity") === -1) {
                  const prevProduct = await sequelize.models.product.findOne({ where: { id: prevProductId } });
                  const nextProduct = await sequelize.models.product.findOne({ where: { id: nextProductId } });

                  // prev product
                  await sequelize.models.product.update({
                    stock: prevProduct.dataValues.stock - parseInt(prevQuantity)
                  }, {
                    where: { id: prevProductId },
                    transaction
                  });

                  // next product
                  await sequelize.models.product.update({
                    stock: nextProduct.dataValues.stock + parseInt(prevQuantity)
                  }, {
                    where: { id: nextProductId },
                    transaction
                  });
               }

              //  수량만 변경하는 경우
               else if(fields.indexOf("product_id") === -1 && fields.indexOf("quantity") !== -1) {
                  const product = await sequelize.models.product.findOne({
                      where: { id: prevProductId },
                      attributes: ["stock"],
                      transaction
                  });

                  await sequelize.models.product.update({
                      stock: product.dataValues.stock - parseInt(prevQuantity) + parseInt(nextQuantity)
                  }, {
                      where: { id: prevProductId },
                      transaction
                  });
               }
            }
        }
    }
  );
  domestic_purchase.associate = function(models) {
    // associations can be defined here
    domestic_purchase.belongsTo(models.purchase_mapper, {
      foreignKey: "mapper_id",
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  };

  return domestic_purchase;
};
