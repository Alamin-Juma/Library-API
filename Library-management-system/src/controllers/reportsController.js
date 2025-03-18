const { BorrowRecord, Book, User } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  // List overdue books with user details
  async listOverdueBooks(req, res) {
    try {
      const today = new Date();

      const overdueBooks = await BorrowRecord.findAll({
        where: {
          returnedAt: null, // Not returned
          dueDate: { [Op.lt]: today }, // Due date is before today
        },
        include: [
          { model: Book, attributes: ["id", "title", "isbn"] }, // Include Book details
          { model: User, attributes: ["id", "name", "email"] }, // Include User details
        ],
      });

      if (overdueBooks.length === 0) {
        return res.status(200).json({ message: "No overdue books found." });
      }

      const formattedData = overdueBooks.map((record) => ({
        bookId: record.Book.id,
        title: record.Book.title,
        isbn: record.Book.isbn,
        userId: record.User.id,
        userName: record.User.name,
        userEmail: record.User.email,
        borrowedAt: record.borrowedAt,
        dueDate: record.dueDate,
        daysOverdue: Math.ceil((today - record.dueDate) / (1000 * 60 * 60 * 24)), // Calculate overdue days
      }));

      res.status(200).json(formattedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch overdue books", details: error.message });
    }
  },
};
