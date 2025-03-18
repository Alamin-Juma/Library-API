const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");

router.get("/overdue", reportsController.listOverdueBooks);

module.exports = router;
