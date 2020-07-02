"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("inventories", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID,
      },
      product: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: "products",
            key: "id"
          },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      warehouse: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: "warehouses",
            key: "id"
          },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ea_per_unit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    return queryInterface.dropTable("inventories");
  },
};
