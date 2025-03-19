import express from "express";
import "reflect-metadata";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import AppDataSource from "../ormconfig";

// Import routes
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import authorRoutes from "./routes/authorRoutes";
import borrowingRoutes from "./routes/borrowingRoutes";
import userRoutes from "./routes/userRoutes";
import reportRoutes from "./routes/reportRoutes";

// Initialize dotenv
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/authors", authorRoutes);
app.use("/api/v1/borrowings", borrowingRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reports", reportRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Initialize database connection and start server
AppDataSource.initialize()
  .then(() => {
    console.log("📚 Database connected successfully!");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });