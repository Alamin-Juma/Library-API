import { Router } from "express";
import { 
  getAllBooks, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook 
} from "../controllers/BookController";
import { auth, canManage } from "../middleware/auth";

const router = Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", [auth, canManage], createBook);
router.put("/:id", [auth, canManage], updateBook);
router.delete("/:id", [auth, canManage], deleteBook);

export default router;