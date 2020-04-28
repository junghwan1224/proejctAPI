"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("products", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID
      },
      images: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      maker: {
        allowNull: true,
        type: Sequelize.STRING
      },
      maker_number: {
        allowNull: true,
        type: Sequelize.STRING
      },
      stock: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      },
      allow_discount: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      price: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      models: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      oe_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quality_cert: {
        type: Sequelize.STRING,
        allowNull: true
      },
      maker_origin: {
        type: Sequelize.STRING,
        allowNull: false
      },
      memo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description_images: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_public: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      attributes: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tags: {
        type: Sequelize.STRING,
        allowNull: true
      },
      optional: {
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
