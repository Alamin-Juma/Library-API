"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BorrowRecord extends Model {
    static associate(models) {
      // Associate BorrowRecord with Book
      BorrowRecord.belongsTo(models.Book, { foreignKey: "bookId", onDelete: "CASCADE" });

      // Associate BorrowRecord with User (if User model exists)
      BorrowRecord.belongsTo(models.User, { foreignKey: "userId", onDelete: "CASCADE" });
    }
  }

  BorrowRecord.init(
    {
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Books", // Should match the table name in your database
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Should match the table name if User model exists
          key: "id",
        },
      },
      borrowedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      returnedAt: {
        type: DataTypes.DATE,
        allowNull: true, // Null means the book hasn't been returned yet
      },
    },
    {
      sequelize,
      modelName: "BorrowRecord",
    }
  );

  return BorrowRecord;
};
