"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A User can borrow multiple books (One-to-Many)
      User.hasMany(models.BorrowRecord, { foreignKey: "userId", onDelete: "CASCADE" });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
