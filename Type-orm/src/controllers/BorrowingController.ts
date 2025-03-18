import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Borrower } from "../entities/Borrower";
import { BookCopy } from "../entities/BookCopy";
import { User } from "../entities/User";
import { BorrowBookDTO } from "../types";
import { LessThan } from "typeorm";

const borrowerRepository = AppDataSource.getRepository(Borrower);
const bookCopyRepository = AppDataSource.getRepository(BookCopy);
const userRepository = AppDataSource.getRepository(User);

export const borrowBook = async (req: Request, res: Response) => {
  try {
    const { userId, copyId, dueDate }: BorrowBookDTO = req.body;

    // Check if user exists and can borrow
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["role"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.role.can_borrow) {
      return res.status(403).json({ message: "User does not have borrowing privileges" });
    }

    // Check if book copy exists and is available
    const bookCopy = await bookCopyRepository.findOne({
      where: { id: copyId },
      relations: ["book"]
    });

    if (!bookCopy) {
      return res.status(404).json({ message: "Book copy not found" });
    }

    if (bookCopy.status !== "Available") {
      return res.status(400).json({ message: "Book copy is not available for borrowing" });
    }

    // Calculate due date (default: 14 days from now)
    const borrowDate = new Date();
    let dueDateObj: Date;
    
    if (dueDate) {
      dueDateObj = new Date(dueDate);
    } else {
      dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + 14);
    }

    // Create borrowing record
    const borrower = borrowerRepository.create({
      user,
      copy: bookCopy,
      borrow_date: borrowDate,
      due_date: dueDateObj,
      return_date: null
    });

    await borrowerRepository.save(borrower);

    // Update book copy status
    bookCopy.status = "Borrowed";
    await bookCopyRepository.save(bookCopy);

    return res.status(201).json({
      message: "Book borrowed successfully",
      borrowingRecord: borrower
    });
  } catch (error) {
    console.error("Error borrowing book:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  try {
    const { borrowId } = req.params;

    const borrowRecord = await borrowerRepository.findOne({
      where: { id: parseInt(borrowId) },
      relations: ["copy", "user"]
    });

    if (!borrowRecord) {
      return res.status(404).json({ message: "Borrowing record not found" });
    }

    if (borrowRecord.return_date) {
      return res.status(400).json({ message: "Book already returned" });
    }

    // Update borrower record
    borrowRecord.return_date = new Date();
    await borrowerRepository.save(borrowRecord);

    // Update book copy status
    const bookCopy = borrowRecord.copy;
    bookCopy.status = "Available";
    await bookCopyRepository.save(bookCopy);

    // Check if return is late
    const isLate = borrowRecord.due_date < borrowRecord.return_date;

    return res.status(200).json({
      message: "Book returned successfully",
      isLate,
      borrowingRecord: borrowRecord
    });
  } catch (error) {
    console.error("Error returning book:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBorrowingHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const borrowHistory = await borrowerRepository.find({
      where: { user: { id: parseInt(userId) } },
      relations: ["copy", "copy.book", "copy.book.authors"]
    });

    return res.status(200).json(borrowHistory);
  } catch (error) {
    console.error("Error fetching borrowing history:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getActiveBorrowings = async (req: Request, res: Response) => {
  try {
    const activeBorrowings = await borrowerRepository.find({
      where: { return_date: null },
      relations: ["user", "copy", "copy.book", "copy.book.authors"]
    });

    return res.status(200).json(activeBorrowings);
  } catch (error) {
    console.error("Error fetching active borrowings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};