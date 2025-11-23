const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");

router.get("/:sessionCode", participantController.listForSession);

module.exports = router;
