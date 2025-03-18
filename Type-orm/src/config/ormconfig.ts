import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { Book } from "../entities/Book";
import { BookCopy } from "../entities/BookCopy";
import { Author } from "../entities/Author";
import { Borrower } from "../entities/Borrower";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "library_management",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Role, Book, BookCopy, Author, Borrower],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});