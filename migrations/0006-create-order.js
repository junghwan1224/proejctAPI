"use strict";

const uuid = require("uuid");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("orders", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: () => uuid(),
        type: Sequelize.UUID,
      },
      date: {
        // 주문 시각
        allowNull: false,
        type: Sequelize.DATE,
      },
      items: {
        // 주문 항목
        allowNull: false,
        type: Sequelize.JSON,
      },
      vat: {
        // 부가세 적용 여부 - true:별도 / false: 포함
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      paid_amount: {
        // 거래액, 실제로 지불한 금액(KRW)
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      client_id: {
        // 거래처 ID 혹은 상호명 문자열
        allowNull: false,
        defaultValue: "",
        type: Sequelize.STRING,
      },
      staff_id: {
        // 거래 등록 사원 외래키
        allowNull: false,
        type: Sequelize.STRING,
      },
      foreign_info: {
        // 해외 거래일 경우 관련 정보, 환율 등...
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSON,
      },
      memo: {
        // 메모
        allowNull: false,
        defaultValue: "",
        type: Sequelize.STRING(4095),
      },
      classification: {
        // 범주 - INCOME / EXPENSE
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        // 구분 - 매출, 매입, 통관, 접대비, 재고자산감모손실, 등등등...
        allowNull: false,
        type: Sequelize.STRING,
      },
      attachments: {
        // 첨부파일
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSON,
      },
      reference: {
        // 참고자료, 통관일 경우 어떤 주문에 대한 통관인지 등록할 수 있음
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSON,
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
    return queryInterface.dropTable("orders");
  },
};
