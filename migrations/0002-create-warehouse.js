"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("warehouses", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING(4095),
        allowNull: false,
      },
      memo: {
        type: Sequelize.STRING(4095),
        allowNull: false,
        defaultValue: "",
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
    return queryInterface.dropTable("warehouses");
  },
};
