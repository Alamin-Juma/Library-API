import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Borrower } from "../entities/Borrower";
import { BookCopy } from "../entities/BookCopy";
import { User } from "../entities/User";
import { BorrowBookDTO } from "../types";
import { IsNull, LessThan } from "typeorm";

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
       res.status(404).json({ message: "User not found" });
       return
    }

    if (!user.role.can_borrow) {
       res.status(403).json({ message: "User does not have borrowing privileges" });
       return
    }

    // Check if book copy exists and is available
    const bookCopy = await bookCopyRepository.findOne({
      where: { id: copyId },
      relations: ["book"]
    });

    if (!bookCopy) {
       res.status(404).json({ message: "Book copy not found" });
       return
    }

    if (bookCopy.status !== "Available") {
       res.status(400).json({ message: "Book copy is not available for borrowing" });
       return
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

     res.status(201).json({
      message: "Book borrowed successfully",
      borrowingRecord: borrower
    });
    return
  } catch (error) {
    console.error("Error borrowing book:", error);
     res.status(500).json({ message: "Server error" });
     return
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
       res.status(404).json({ message: "Borrowing record not found" });
       return
    }

    if (borrowRecord.return_date) {
       res.status(400).json({ message: "Book already returned" });
       return
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

     res.status(200).json({
      message: "Book returned successfully",
      isLate,
      borrowingRecord: borrowRecord
    });
    return
  } catch (error) {
    console.error("Error returning book:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const getBorrowingHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const borrowHistory = await borrowerRepository.find({
      where: { user: { id: parseInt(userId) } },
      relations: ["copy", "copy.book", "copy.book.authors"]
    });

     res.status(200).json(borrowHistory);
     return
  } catch (error) {
    console.error("Error fetching borrowing history:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const getActiveBorrowings = async (req: Request, res: Response) => {
  try {
    const activeBorrowings = await borrowerRepository.find({
        where: { return_date: IsNull() },
        relations: ["user", "copy", "copy.book", "copy.book.authors"]
      });

     res.status(200).json(activeBorrowings);
     return
  } catch (error) {
    console.error("Error fetching active borrowings:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};