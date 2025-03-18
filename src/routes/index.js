const express = require("express");
const router = express.Router();
const bookRoutes = require("./bookRoutes");
// const userRoutes = require("./userRoutes");

// e.g., /api/books
router.use("/books", bookRoutes);
// e.g., /api/users
// router.use("/users", userRoutes);

module.exports = router;
