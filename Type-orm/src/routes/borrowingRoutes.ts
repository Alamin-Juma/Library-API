import { Router } from "express";
import {
  borrowBook,
  returnBook,
  getBorrowingHistory,
  getActiveBorrowings
} from "../controllers/BorrowingController";
import { auth, canBorrow, canManage } from "../middleware/auth";

const router = Router();

router.post("/borrow", [auth, canBorrow], borrowBook);
router.post("/return/:borrowId", [auth, canManage], returnBook);
router.get("/user/:userId", auth, getBorrowingHistory);
router.get("/active", [auth, canManage], getActiveBorrowings);

export default router;