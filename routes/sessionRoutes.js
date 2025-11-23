const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

router.post("/", sessionController.createSession);
router.get("/:code", sessionController.getSessionByCode);
router.post("/:code/join", sessionController.joinSession);

module.exports = router;
