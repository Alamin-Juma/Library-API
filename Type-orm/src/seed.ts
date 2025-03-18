import { AppDataSource } from "./config/ormconfig";
import { Role } from "./entities/Role";
import { User } from "./entities/User";
import { Author } from "./entities/Author";
import { Book } from "./entities/Book";
import { BookCopy } from "./entities/BookCopy";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected!");
    
    // Create roles if they don't exist
    const roleRepository = AppDataSource.getRepository(Role);
    const existingRoles = await roleRepository.find();
    
    if (existingRoles.length === 0) {
      console.log("Creating roles...");
      const roles = [
        roleRepository.create({ role_name: "Admin", can_borrow: true, can_manage: true, is_admin: true }),
        roleRepository.create({ role_name: "Librarian", can_borrow: false, can_manage: true, is_admin: false }),
        roleRepository.create({ role_name: "Member", can_borrow: true, can_manage: false, is_admin: false })
      ];
      await roleRepository.save(roles);
    }
    
    // Create admin user if it doesn't exist
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({ where: { email: "admin@library.com" } });
    
    if (!adminUser) {
      console.log("Creating admin user...");
      const adminRole = await roleRepository.findOne({ where: { role_name: "Admin" } });
      
      if (!adminRole) {
        throw new Error("Admin role not found!");
      }
      
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newAdmin = userRepository.create({
        name: "Admin",
        email: "admin@library.com",
        password: hashedPassword,
        role: adminRole
      });
      
      await userRepository.save(newAdmin);
    }
    
    // Create sample authors
    const authorRepository = AppDataSource.getRepository(Author);
    const authorsCount = await authorRepository.count();
    
    if (authorsCount === 0) {
      console.log("Creating sample authors...");
      const authors = [
        authorRepository.create({ name: "George Orwell", bio: "English novelist and essayist." }),
        authorRepository.create({ name: "J.K. Rowling", bio: "British author and philanthropist." }),
        authorRepository.create({ name: "Jane Austen", bio: "English novelist known for her six major novels." })
      ];
      
      await authorRepository.save(authors);
    }
    
    // Create sample books
    const bookRepository = AppDataSource.getRepository(Book);
    const booksCount = await bookRepository.count();
    
    if (booksCount === 0) {
      console.log("Creating sample books...");
      const authors = await authorRepository.find();
      
      // Create books with authors
      const books = [
        bookRepository.create({
          title: "1984",
          isbn: "9780451524935",
          publication_year: 1949,
          average_rating: 4.5,
          image_url: "https://placeholder.com/1984.jpg",
          books_count: 3,
          authors: [authors[0]] // George Orwell
        }),
        bookRepository.create({
          title: "Harry Potter and the Philosopher's Stone",
          isbn: "9780747532699",
          publication_year: 1997,
          average_rating: 4.7,
          image_url: "https://placeholder.com/hp1.jpg",
          books_count: 5,
          authors: [authors[1]] // J.K. Rowling
        }),
        bookRepository.create({
          title: "Pride and Prejudice",
          isbn: "9780141439518",
          publication_year: 1813,
          average_rating: 4.3,
          image_url: "https://placeholder.com/pride.jpg",
          books_count: 2,
          authors: [authors[2]] // Jane Austen
        })
      ];
      
      await bookRepository.save(books);
      
      // Create book copies
      console.log("Creating book copies...");
      const bookCopyRepository = AppDataSource.getRepository(BookCopy);
      const copies = [];
      
      for (const book of books) {
        for (let i = 1; i <= book.books_count; i++) {
          copies.push(
            bookCopyRepository.create({
              book: book,
              inventory_number: `${book.id}-${i}`,
              condition: i === 1 ? "New" : i === 2 ? "Good" : "Fair",
              status: "Available"
            })
          );
        }
      }
      
      await bookCopyRepository.save(copies);
    }
    
    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the seeding function
seedDatabase();