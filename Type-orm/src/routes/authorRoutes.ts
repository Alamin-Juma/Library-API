import { Router } from "express";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
} from "../controllers/AuthorController";
import { auth, canManage } from "../middleware/auth";

const router = Router();

router.get("/", getAllAuthors);
router.get("/:id", getAuthorById);
router.post("/", [auth, canManage], createAuthor);
router.put("/:id", [auth, canManage], updateAuthor);
router.delete("/:id", [auth, canManage], deleteAuthor);

export default router;