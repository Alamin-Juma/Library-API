import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Middleware for Authentication (Verifies JWT Token)
export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Middleware to Check if User is an Admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "Admin") {
    res.status(403).json({ message: "Access denied: Admin role required" });
    return;
  }
  next();
};

// Middleware to Check if User can Manage (Admin or Librarian)
export const canManage = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== "Admin" && req.user.role !== "Librarian")) {
    res.status(403).json({ message: "Access denied: Management privileges required" });
    return;
  }
  next();
};

// Middleware to Check if User can Borrow Books (Admin or Member)
export const canBorrow = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== "Admin" && req.user.role !== "Member")) {
    res.status(403).json({ message: "Access denied: Borrowing privileges required" });
    return;
  }
  next();
};
