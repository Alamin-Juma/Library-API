import AppDataSource from "../ormconfig";
import { Role } from "./entities/Role";
import { User } from "./entities/User";
import { Author } from "./entities/Author";
import { Book } from "./entities/Book";
import { BookCopy } from "./entities/BookCopy";
import bcrypt from "bcryptjs";
import axios from "axios";

async function fetchBooksFromURL() {
  try {
    console.log("🌍 Fetching books from JSON URL...");
    const response = await axios.get("https://raw.githubusercontent.com/rapidtechinsights/hr-assignment/refs/heads/main/books.json");
    return response.data; // Return book array
  } catch (error) {
    console.error("❌ Failed to fetch books:", error);
    throw new Error("Book fetching failed");
  }
}

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("📡 Database connected!");

    // Create roles if they don't exist
    const roleRepository = AppDataSource.getRepository(Role);
    const existingRoles = await roleRepository.find();

    if (existingRoles.length === 0) {
      console.log("🔑 Creating roles...");
      const roles = [
        roleRepository.create({ role_name: "Admin", can_borrow: true, can_manage: true, is_admin: true }),
        roleRepository.create({ role_name: "Librarian", can_borrow: false, can_manage: true, is_admin: false }),
        roleRepository.create({ role_name: "Member", can_borrow: true, can_manage: false, is_admin: false }),
      ];
      await roleRepository.save(roles);
    }

    // Create admin user if it doesn't exist
    const userRepository = AppDataSource.getRepository(User);
    const adminUser = await userRepository.findOne({ where: { email: "admin@library.com" } });

    if (!adminUser) {
      console.log("👨‍💼 Creating admin user...");
      const adminRole = await roleRepository.findOne({ where: { role_name: "Admin" } });

      if (!adminRole) {
        throw new Error("❌ Admin role not found!");
      }

      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newAdmin = userRepository.create({
        name: "Admin",
        email: "admin@library.com",
        password: hashedPassword,
        role: adminRole,
      });

      await userRepository.save(newAdmin);
    }

    // Fetch books dynamically from JSON
    const booksData = await fetchBooksFromURL();

    // Create authors and books
    const authorRepository = AppDataSource.getRepository(Author);
    const bookRepository = AppDataSource.getRepository(Book);
    const bookCopyRepository = AppDataSource.getRepository(BookCopy);

    for (const bookData of booksData) {
      const { book_id, books_count, isbn, authors, publication_year, title, average_rating, image_url } = bookData;

      if (!title || !isbn || !authors || !publication_year) {
        console.warn(`⚠️ Skipping invalid book entry: ${title}`);
        continue;
      }

      // Ensure authors exist
      const authorEntities = await Promise.all(
        authors.split(", ").map(async (authorName) => {
          let author = await authorRepository.findOne({ where: { name: authorName } });
          if (!author) {
            author = authorRepository.create({ name: authorName, bio: "No bio available" });
            await authorRepository.save(author);
          }
          return author;
        })
      );

      // Check if book already exists
      let book = await bookRepository.findOne({ where: { isbn: String(isbn) } });

      if (!book) {
        console.log(`📖 Creating book: ${title}`);

        book = bookRepository.create({
          title,
          isbn: String(isbn),
          publication_year: publication_year || 2000, 
          average_rating: average_rating || 3.0, 
          image_url: image_url || "https://via.placeholder.com/150",
          books_count: books_count || 1,
          authors: authorEntities,
        });

        await bookRepository.save(book);
      }

      // Create book copies
      console.log(`📚 Creating ${books_count} copies of "${title}"...`);
      const copies = [];
      for (let i = 1; i <= books_count; i++) {
        copies.push(
          bookCopyRepository.create({
            book: book,
            inventory_number: `${book.id}-${i}`,
            condition: i === 1 ? "New" : i === 2 ? "Good" : "Fair",
            status: "Available",
          })
        );
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