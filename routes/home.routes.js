const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("Hello There!");
});

module.exports = router;
