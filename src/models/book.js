"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      // Many-to-Many Relationship with Authors
      Book.belongsToMany(models.Author, { through: "BookAuthors", foreignKey: "bookId" });

      // One-to-Many Relationship with BorrowRecord
      Book.hasMany(models.BorrowRecord, { foreignKey: "bookId", onDelete: "CASCADE" });
    }
  }

  Book.init(
    {
      title: DataTypes.STRING,
      isbn: DataTypes.STRING,
      publicationYear: DataTypes.INTEGER,
      image: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      copies: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Book"
    }
  );

  return Book;
};
