const express = require("express");
const router = express.Router();
const controller = require("../controllers/expenses.controller");

router.get("/", controller.getAll);

module.exports = router;
