import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Borrower } from "../entities/Borrower";
import { IsNull, LessThan } from "typeorm";

const borrowerRepository = AppDataSource.getRepository(Borrower);

export const getOverdueBooks = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    
    const overdueBooks = await borrowerRepository.find({
      where: {
        due_date: LessThan(today),
        return_date: IsNull()
      },
      relations: ["user", "copy", "copy.book", "copy.book.authors"]
    });

    // Add days overdue calculation
    const overdueWithDays = overdueBooks.map(record => {
      const dueDate = new Date(record.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...record,
        daysOverdue
      };
    });

     res.status(200).json(overdueWithDays);
     return
  } catch (error) {
    console.error("Error fetching overdue books:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const getBorrowingStatistics = async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    // Base query builder
    const queryBuilder = borrowerRepository.createQueryBuilder("borrower")
      .leftJoinAndSelect("borrower.user", "user")
      .leftJoinAndSelect("borrower.copy", "copy")
      .leftJoinAndSelect("copy.book", "book");
    
    // Apply date filters if provided
    if (startDate) {
      queryBuilder.andWhere("borrower.borrow_date >= :startDate", { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere("borrower.borrow_date <= :endDate", { endDate });
    }
    
    const borrowings = await queryBuilder.getMany();
    
    // Calculate statistics
    const totalBorrowings = borrowings.length;
    const returnedBorrowings = borrowings.filter(b => b.return_date).length;
    const overdueBorrowings = borrowings.filter(b => {
      if (!b.return_date) {
        return new Date() > new Date(b.due_date);
      }
      return new Date(b.return_date) > new Date(b.due_date);
    }).length;
    
    // Most borrowed books
    const bookBorrowCounts: Record<string, { title: string, count: number }> = {};
    borrowings.forEach(b => {
      const bookId = b.copy.book.id;
      const bookTitle = b.copy.book.title;
      
      if (!bookBorrowCounts[bookId]) {
        bookBorrowCounts[bookId] = { title: bookTitle, count: 0 };
      }
      
      bookBorrowCounts[bookId].count++;
    });
    
    const mostBorrowedBooks = Object.values(bookBorrowCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
     res.status(200).json({
      totalBorrowings,
      returnedBorrowings,
      overdueBorrowings,
      returnRate: totalBorrowings ? (returnedBorrowings / totalBorrowings) * 100 : 0,
      overdueRate: totalBorrowings ? (overdueBorrowings / totalBorrowings) * 100 : 0,
      mostBorrowedBooks
    });
    return
  } catch (error) {
    console.error("Error generating statistics:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};