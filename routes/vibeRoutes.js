const express = require("express");
const router = express.Router();
const vibeController = require("../controllers/vibeController");

router.post("/", vibeController.createVibe);

module.exports = router;
