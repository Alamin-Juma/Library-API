"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First ensure the table exists
    await queryInterface.describeTable("Books").catch(async () => {
      await queryInterface.createTable("Books", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        isbn: {
          type: Sequelize.STRING,
          allowNull: false
        },
        publicationYear: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        image: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: "https://images.gr-assets.com/books/1474154022m/3.jpg"
        },
        rating: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: 0.0
        },
        copies: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
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
    });

    // Now update the columns
    await queryInterface.changeColumn("Books", "title", {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn("Books", "isbn", {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn("Books", "publicationYear", {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn("Books", "image", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "https://images.gr-assets.com/books/1474154022m/3.jpg"
    });

    await queryInterface.changeColumn("Books", "rating", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0
    });

    await queryInterface.changeColumn("Books", "copies", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Optional: Rollback logic if needed
  }
};