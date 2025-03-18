"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Books", "title", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Books", "isbn", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("Books", "publicationYear", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn("Books", "copies", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });

    await queryInterface.changeColumn("Books", "image", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "https://example.com/default-image.jpg",
    });

    await queryInterface.changeColumn("Books", "rating", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: Define rollback actions here if needed
  },
};
