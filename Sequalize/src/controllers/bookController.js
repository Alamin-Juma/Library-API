const { Book, Author, User, BorrowRecord } = require("../models");

module.exports = {
  // List all books with pagination
  async listBooks(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const books = await Book.findAndCountAll({
        include: [{ model: Author, through: { attributes: [] } }], // Include authors
        offset,
        limit: parseInt(limit),
      });

      // Format the response to match the data seeder structure
      const formattedBooks = books.rows.map((book) => ({
        book_id: book.id,
        books_count: book.copies,
        isbn: book.isbn,
        authors: book.Authors.map((author) => author.name).join(", "),
        publication_year: book.publicationYear,
        title: book.title,
        average_rating: book.rating,
        image_url: book.image,
      }));

      res.status(200).json({
        total: books.count,
        page: parseInt(page),
        limit: parseInt(limit),
        books: formattedBooks,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books", details: error.message });
    }
  },

  // Create a new book
  async createBook(req, res) {
    try {
      const { title, isbn, publicationYear, image, rating, copies, authors } = req.body;

      // Create the book
      const book = await Book.create({
        title,
        isbn,
        publicationYear,
        image,
        rating,
        copies,
      });

      // Create or link authors
      if (authors && authors.length > 0) {
        const authorNames = authors.split(", "); // Assuming authors is a comma-separated string
        const authorRecords = await Promise.all(
          authorNames.map((name) =>
            Author.findOrCreate({ where: { name }, defaults: { name } })
          )
        );
        await book.setAuthors(authorRecords.map((record) => record[0]));
      }

      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ error: "Failed to create book", details: error.message });
    }
  },

  // Get a single book by ID
  async getBook(req, res) {
    try {
      const { id } = req.params;
      const book = await Book.findByPk(id, {
        include: [{ model: Author, through: { attributes: [] } }], // Include authors
      });

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Format the response to match the data seeder structure
      const formattedBook = {
        book_id: book.id,
        books_count: book.copies,
        isbn: book.isbn,
        authors: book.Authors.map((author) => author.name).join(", "),
        publication_year: book.publicationYear,
        title: book.title,
        average_rating: book.rating,
        image_url: book.image,
      };

      res.status(200).json(formattedBook);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book", details: error.message });
    }
  },

  // Update an existing book
  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const { title, isbn, publicationYear, image, rating, copies, authors } = req.body;

      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Update book details
      await book.update({
        title,
        isbn,
        publicationYear,
        image,
        rating,
        copies,
      });

      // Update authors if provided
      if (authors && authors.length > 0) {
        const authorNames = authors.split(", "); // Assuming authors is a comma-separated string
        const authorRecords = await Promise.all(
          authorNames.map((name) =>
            Author.findOrCreate({ where: { name }, defaults: { name } })
          )
        );
        await book.setAuthors(authorRecords.map((record) => record[0]));
      }

      res.status(200).json(book);
    } catch (error) {
      res.status(400).json({ error: "Failed to update book", details: error.message });
    }
  },

  // Delete a book (only if not borrowed)
  async deleteBook(req, res) {
    try {
      const { id } = req.params;

      // Check if the book is currently borrowed
      const isBorrowed = await BorrowRecord.findOne({
        where: { bookId: id, returnedAt: null },
      });

      if (isBorrowed) {
        return res.status(400).json({ error: "Cannot delete a book that is currently borrowed" });
      }

      // Delete the book
      await Book.destroy({ where: { id } });

      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({ error: "Failed to delete book", details: error.message });
    }
  },

  // Borrow a book
  async borrowBook(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Find the book
      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      // Check if the book is available
      if (book.copies <= 0) {
        return res.status(400).json({ error: "No copies available to borrow" });
      }

      // Check if the user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create a borrow record
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // Default due date is 14 days from now

      await BorrowRecord.create({
        bookId: id,
        userId,
        borrowedAt: new Date(),
        dueDate,
      });

      // Decrement the book's copies
      await book.decrement("copies");

      res.status(200).json({ message: "Book borrowed successfully", dueDate });
    } catch (error) {
      res.status(500).json({ error: "Failed to borrow book", details: error.message });
    }
  },

  // Return a book
  async returnBook(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Find the borrow record
      const borrowRecord = await BorrowRecord.findOne({
        where: { bookId: id, userId, returnedAt: null },
      });

      if (!borrowRecord) {
        return res.status(404).json({ error: "No active borrow record found for this book and user" });
      }

      // Update the borrow record
      borrowRecord.returnedAt = new Date();
      await borrowRecord.save();

      // Increment the book's copies
      const book = await Book.findByPk(id);
      await book.increment("copies");

      // Check if the book was returned late
      const isLate = borrowRecord.returnedAt > borrowRecord.dueDate;
      const daysOverdue = isLate
        ? Math.ceil((borrowRecord.returnedAt - borrowRecord.dueDate) / (1000 * 60 * 60 * 24))
        : 0;

      res.status(200).json({ message: "Book returned successfully", isLate, daysOverdue });
    } catch (error) {
      res.status(500).json({ error: "Failed to return book", details: error.message });
    }
  },
};