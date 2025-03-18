const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.get("/", bookController.listBooks);
router.post("/", bookController.createBook);
router.get("/:id", bookController.getBook);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

router.post("/:id/borrow", bookController.borrowBook);
router.post("/:id/return", bookController.returnBook);

module.exports = router;
