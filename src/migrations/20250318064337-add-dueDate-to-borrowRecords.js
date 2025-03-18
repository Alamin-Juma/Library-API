"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("BorrowRecords", "dueDate", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP + INTERVAL '14 days'"), // Default due date 14 days later
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("BorrowRecords", "dueDate");
  },
};
