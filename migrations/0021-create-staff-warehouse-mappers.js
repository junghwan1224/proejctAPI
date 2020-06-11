"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("staff_warehouse_mappers", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID,
      },
      staff_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
              model: "staffs",
              key: "id"
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
      },
      warehouse_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: "warehouses",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: "products",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("staff_warehouse_mappers");
  },
};
