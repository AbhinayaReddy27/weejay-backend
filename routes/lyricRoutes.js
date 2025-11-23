const express = require("express");
const router = express.Router();
const lyricController = require("../controllers/lyricController");

router.post("/", lyricController.createLyric);
router.patch("/:id/vote", lyricController.voteLyric);

module.exports = router;
