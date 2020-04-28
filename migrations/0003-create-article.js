"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("articles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      title: {
        // 제목
        allowNull: false,
        type: Sequelize.STRING
      },
      type: {
        // 게시글 타입: 'NOTICE', 'FAQ'
        allowNull: false,
        type: Sequelize.STRING
      },
      contents: {
        // 내용
        allowNull: false,
        type: Sequelize.TEXT
      },
      date: {
        // 사이트에 실제로 기재할 날짜
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      createdAt: {
        // 생성 일자
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        // 변경 일자
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("articles");
  }
};
