import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Book } from "../entities/Book";
import { Author } from "../entities/Author";
import { BookCopy } from "../entities/BookCopy";
import { Borrower } from "../entities/Borrower";
import { BookCreateDTO, BookUpdateDTO } from "../types";
import { In, Like } from "typeorm";

const bookRepository = AppDataSource.getRepository(Book);
const authorRepository = AppDataSource.getRepository(Author);
const bookCopyRepository = AppDataSource.getRepository(BookCopy);
const borrowerRepository = AppDataSource.getRepository(Borrower);

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const queryBuilder = bookRepository.createQueryBuilder("book")
      .leftJoinAndSelect("book.authors", "author")
      .leftJoinAndSelect("book.copies", "copy");

    if (search) {
      queryBuilder.where("LOWER(book.title) LIKE LOWER(:search) OR LOWER(book.isbn) LIKE LOWER(:search) OR LOWER(author.name) LIKE LOWER(:search)", 
                         { search: `%${search}%` });
    }

    const [books, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

     res.status(200).json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalBooks: total
    });
    return
  } catch (error) {
    console.error("Error fetching books:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await bookRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["authors", "copies"]
    });

    if (!book) {
       res.status(404).json({ message: "Book not found" });
       return
    }

     res.status(200).json(book);
     return
  } catch (error) {
    console.error("Error fetching book:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, isbn, publicationYear, authors, imageUrl, averageRating, copiesCount }: BookCreateDTO = req.body;

    // Check if book already exists
    const existingBook = await bookRepository.findOne({ where: { isbn } });
    if (existingBook) {
       res.status(400).json({ message: "A book with this ISBN already exists" });
       return
    }

    const bookAuthors: Author[] = [];

    // Process authors (can be ids or new authors)
    for (const authorData of authors) {
      let author: Author;
      
      if (typeof authorData === 'number') {
        // Author ID provided
        author = await authorRepository.findOneOrFail({ where: { id: authorData } });
      } else if ('id' in authorData) {
        // Author object with ID provided
        author = await authorRepository.findOneOrFail({ where: { id: authorData.id } });
      } else {
        // New author name provided
        const existingAuthor = await authorRepository.findOne({ where: { name: authorData.name } });
        
        if (existingAuthor) {
          author = existingAuthor;
        } else {
          // Create new author
          const newAuthor = authorRepository.create({ name: authorData.name });
          author = await authorRepository.save(newAuthor);
        }
      }
      
      bookAuthors.push(author);
    }

    // Create new book
    const newBook = bookRepository.create({
      title,
      isbn,
      publication_year: publicationYear,
      image_url: imageUrl,
      average_rating: averageRating || null,
      books_count: copiesCount,
      authors: bookAuthors
    });

    const savedBook = await bookRepository.save(newBook);

    // Create book copies
    for (let i = 1; i <= copiesCount; i++) {
      const bookCopy = bookCopyRepository.create({
        book: savedBook,
        inventory_number: `${savedBook.id}-${i}`,
        condition: "New",
        status: "Available"
      });
      await bookCopyRepository.save(bookCopy);
    }

     res.status(201).json({
      message: "Book created successfully",
      book: savedBook
    });
    return
  } catch (error) {
    console.error("Error creating book:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, isbn, publicationYear, authors, imageUrl, averageRating }: BookUpdateDTO = req.body;

    const book = await bookRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["authors"]
    });

    if (!book) {
       res.status(404).json({ message: "Book not found" });
       return
    }

    // Check if book is currently borrowed
    const borrowedCopiesCount = await bookCopyRepository.count({
      where: {
        book: { id: parseInt(id) },
        status: "Borrowed"
      }
    });

    if (borrowedCopiesCount > 0) {
       res.status(400).json({ message: "Cannot update a book that is currently borrowed" });
       return
    }

    // Update book data
    if (title) book.title = title;
    if (isbn && isbn !== book.isbn) {
      const existingBook = await bookRepository.findOne({ where: { isbn } });
      if (existingBook && existingBook.id !== parseInt(id)) {
         res.status(400).json({ message: "A book with this ISBN already exists" });
         return
      }
      book.isbn = isbn;
    }
    if (publicationYear) book.publication_year = publicationYear;
    if (imageUrl) book.image_url = imageUrl;
    if (averageRating !== undefined) book.average_rating = averageRating;

    // Update authors if provided
    if (authors && authors.length > 0) {
      const bookAuthors: Author[] = [];

      for (const authorData of authors) {
        let author: Author;
        
        if (typeof authorData === 'number') {
          author = await authorRepository.findOneOrFail({ where: { id: authorData } });
        } else if ('id' in authorData) {
          author = await authorRepository.findOneOrFail({ where: { id: authorData.id } });
        } else {
          const existingAuthor = await authorRepository.findOne({ where: { name: authorData.name } });
          
          if (existingAuthor) {
            author = existingAuthor;
          } else {
            const newAuthor = authorRepository.create({ name: authorData.name });
            author = await authorRepository.save(newAuthor);
          }
        }
        
        bookAuthors.push(author);
      }

      book.authors = bookAuthors;
    }

    await bookRepository.save(book);

     res.status(200).json({
      message: "Book updated successfully",
      book
    });
    return
  } catch (error) {
    console.error("Error updating book:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const book = await bookRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["copies"]
    });

    if (!book) {
       res.status(404).json({ message: "Book not found" });
       return
    }

    // Check if any copies are currently borrowed
    const borrowedCopiesCount = await bookCopyRepository.count({
      where: {
        book: { id: parseInt(id) },
        status: "Borrowed"
      }
    });

    if (borrowedCopiesCount > 0) {
       res.status(400).json({ message: "Cannot delete a book that is currently borrowed" });
       return
    }

    // Delete all copies first
    await bookCopyRepository.delete({ book: { id: parseInt(id) } });

    // Then delete the book
    await bookRepository.delete(id);

     res.status(200).json({ message: "Book deleted successfully" });
     return
  } catch (error) {
    console.error("Error deleting book:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
};