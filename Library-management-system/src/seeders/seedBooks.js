"use strict";
const axios = require("axios");
const { Book, Author } = require("../models"); // Ensure this is correctly importing models

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Fetch books dataset
      const response = await axios.get(
        "https://raw.githubusercontent.com/rapidtechinsights/hr-assignment/main/books.json"
      );
      const booksData = response.data;

      for (const book of booksData) {
        // Create or find authors
        const authorNames = book.authors.split(", ");
        const authorInstances = await Promise.all(
          authorNames.map((name) =>
            Author.findOrCreate({ where: { name }, defaults: { name } })
          )
        );

        // Create the book
        const createdBook = await Book.create({
          title: book.title,
          isbn: book.isbn,
          publicationYear: book.publication_year,
          image: book.image_url,
          rating: book.average_rating,
          copies: book.books_count,
        });

        // Associate authors with the book
        await createdBook.setAuthors(authorInstances.map((author) => author[0]));
      }

      console.log("✅ Books and Authors seeded successfully!");
    } catch (error) {
      console.error("❌ Error seeding books:", error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: Delete all books and authors
    await Book.destroy({ where: {} });
    await Author.destroy({ where: {} });
    console.log("❌ Books and Authors removed.");
  },
};
