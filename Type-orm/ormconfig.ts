import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./src/entities/User";
import { Role } from "./src/entities/Role";
import { Book } from "./src/entities/Book";
import { BookCopy } from "./src/entities/BookCopy";
import { Author } from "./src/entities/Author";
import { Borrower } from "./src/entities/Borrower";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "QWEiop5991", 
  database: process.env.DB_NAME || "library_management",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Role, Book, BookCopy, Author, Borrower],
  migrations: [__dirname + '/src/migrations/**/*.ts'],
  migrationsTableName: 'migrations',
  subscribers: [],
});

// Export the data source
export default AppDataSource;