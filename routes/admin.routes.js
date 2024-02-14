const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { Queries } = require("../models/Queries");
const authMiddleware = require("../middleware/authMiddleware");

/* Admin APIs */

router.get("/", authMiddleware, adminController.getAllQueries);

router.put("/:id", authMiddleware, adminController.editQuery);

router.delete("/:id", authMiddleware, adminController.deleteQuery);

router.get("/:id", authMiddleware, adminController.getQueryDetails);

module.exports = router;
