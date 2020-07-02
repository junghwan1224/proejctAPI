"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("clients", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID,
      },
      name: { // 거래처명
        type: Sequelize.STRING,
        allowNull: false,
      },
      crn: { // 사업자등록번호
        type: Sequelize.STRING,
        allowNull: true,
      },
      business_type: { // 업태
        type: Sequelize.STRING,
        allowNull: true,
      },
      business_item: { // 종목
        type: Sequelize.STRING,
        allowNull: true,
      },
      representative: { // 회사 대표명
        type: Sequelize.STRING,
        allowNull: false,
      },
      poc1: { // 연락처1
        type: Sequelize.STRING,
        allowNull: true,
      },
      poc2: { // 연락처2
        type: Sequelize.STRING,
        allowNull: true,
      },
      fax: { // 팩스
        type: Sequelize.STRING,
        allowNull: true,
      },
      worker: { // 거래처 담당자명
        type: Sequelize.STRING,
        allowNull: true,
      },
      worker_email: { // 거래처 담당자 이메일
        type: Sequelize.STRING,
        allowNull: true,
      },
      worker_poc: { // 거래처 담당자 연락처
        type: Sequelize.STRING,
        allowNull: true,
      },
      staff_id: { // 담당 사원
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: "staffs",
            key: "id"
          },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      default_price_type: { // 초기 가격 종류
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "A"
      },
      postcode: { // 우편 번호
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: { // 우편 주소
        type: Sequelize.STRING,
        allowNull: true,
      },
      trade_type: { // 거래처 종류 ex) BUYER, SELLER, BOTH
        type: Sequelize.STRING,
        allowNull: false,
      },
      memo: { // 메모
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
    return queryInterface.dropTable("clients");
  },
};
