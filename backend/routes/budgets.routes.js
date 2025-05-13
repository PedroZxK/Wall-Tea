const express = require("express");
const router = express.Router();
const controller = require("../controllers/budgets.controller");

router.get("/", controller.getAll);

module.exports = router;
