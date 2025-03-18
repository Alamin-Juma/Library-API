"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define many-to-many association with Authors
      Book.belongsToMany(models.Author, { through: "BookAuthors", foreignKey: "bookId" });
    }
  }

  Book.init(
    {
      title: DataTypes.STRING,
      isbn: DataTypes.STRING,
      publicationYear: DataTypes.INTEGER,
      image: DataTypes.STRING,
      rating: DataTypes.FLOAT,
      copies: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Book",
    }
  );

  return Book;
};
