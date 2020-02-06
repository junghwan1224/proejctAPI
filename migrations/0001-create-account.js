"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("accounts", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID
      },
      account_level_name: {
        type: Sequelize.STRING,
        references: {
          model: "account_levels",
          key: "name"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      crn: {
        type: Sequelize.STRING,
        allowNull: true
      },
      mileage: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 11
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("accounts");
  }
};
