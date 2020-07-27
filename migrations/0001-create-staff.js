"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("staffs", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rank: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      permission: {
        type: Sequelize.STRING(8191),
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
    return queryInterface.dropTable("staffs");
  },
};
