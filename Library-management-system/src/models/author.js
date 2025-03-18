"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      // Define many-to-many association with Books
      Author.belongsToMany(models.Book, { through: "BookAuthors", foreignKey: "authorId" });
    }
  }

  Author.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Author",
    }
  );

  return Author;
};
