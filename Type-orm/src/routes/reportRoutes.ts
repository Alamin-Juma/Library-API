import { Router } from "express";
import {
  getOverdueBooks,
  getBorrowingStatistics
} from "../controllers/ReportController";
import { auth, canManage } from "../middleware/auth";

const router = Router();

router.get("/overdue", [auth, canManage], getOverdueBooks);
router.get("/statistics", [auth, canManage], getBorrowingStatistics);

export default router;
