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
        type: Sequelize.UUID,
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
      price: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      discount_rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quality_cert: {
        type: Sequelize.STRING,
        allowNull: true
      },
      memo: {
        type: Sequelize.TEXT,
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
