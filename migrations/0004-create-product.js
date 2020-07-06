"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("products", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID,
      },
      name: {
        // 제품명
        type: Sequelize.STRING,
        allowNull: false,
      },
      unit: {
        // 단위(EA, SET, ...)
        type: Sequelize.STRING,
        allowNull: false,
      },
      specification: {
        // 규격(외경, 내경, ...)
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "",
      },
      type: {
        // 분류명
        type: Sequelize.STRING,
        allowNull: false,
      },
      price_a: {
        // 가격 A (초기값 0, 단위: KRW)
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price_b: {
        // 가격 B (초기값 0, 단위: KRW)
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price_c: {
        // 가격 C (초기값 0, 단위: KRW)
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price_d: {
        // 가격 D (초기값 0, 단위: KRW)
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price_e: {
        // 가격 E (초기값 0, 단위: KRW)
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      essential_stock: {
        // 적정 재고
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      memo: {
        // 메모
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "",
      },
      image: {
        // 제품 이미지 URL
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable("products");
  },
};
