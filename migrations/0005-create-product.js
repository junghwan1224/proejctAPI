"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      abstract_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "product_abstracts",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      oe_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_year: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
      },
      end_year: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true
      },
      engine: {
        type: Sequelize.STRING,
        allowNull: true
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
    return queryInterface.dropTable("products");
  }
};
