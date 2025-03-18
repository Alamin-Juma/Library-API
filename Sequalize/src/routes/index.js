const express = require("express");
const router = express.Router();
const bookRoutes = require("./bookRoutes");
const userRoutes = require("./userRoutes");
const reportsRoutes = require("./reportsRoutes");

router.use("/books", bookRoutes);
router.use("/users", userRoutes);
router.use("/reports", reportsRoutes);

module.exports = router;
