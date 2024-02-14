const express = require("express");
const router = express.Router();
const queriesController = require("../controllers/queries.controller");

/* Client APIs */
router.post("/", queriesController.submitQueries);

module.exports = router;
