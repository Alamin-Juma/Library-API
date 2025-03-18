import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/UserController";
import { auth, isAdmin } from "../middleware/auth";

const router = Router();

router.get("/", [auth, isAdmin], getAllUsers);
router.get("/:id", auth, getUserById);
router.post("/", [auth, isAdmin], createUser);
router.put("/:id", [auth, isAdmin], updateUser);
router.delete("/:id", [auth, isAdmin], deleteUser);

export default router;