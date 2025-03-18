import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ message: "Access denied: Admin role required" });
  }
  next();
};

export const canManage = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Admin" && req.user?.role !== "Librarian") {
    return res.status(403).json({ message: "Access denied: Management privileges required" });
  }
  next();
};

export const canBorrow = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Admin" && req.user?.role !== "Member") {
    return res.status(403).json({ message: "Access denied: Borrowing privileges required" });
  }
  next();
};