"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("purchase_mappers", {
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
      supplier_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
              model: "suppliers",
              key: "id"
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
      },
      date: {
          type: Sequelize.DATE,
          allowNull: false,
      },
      verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      memo: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    return queryInterface.dropTable("purchase_mappers");
  },
};
