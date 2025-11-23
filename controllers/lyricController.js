const Lyric = require("../models/Lyric");

exports.createLyric = async (req, res) => {
  try {
    const { sessionCode, participantId, text } = req.body;

    const lyric = await Lyric.create({
      sessionCode,
      participant: participantId || null,
      text,
    });

    res.status(201).json(lyric);
  } catch (err) {
    console.error("Error creating lyric:", err);
    res.status(500).json({ message: "Failed to create lyric" });
  }
};

exports.voteLyric = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body;

    const lyric = await Lyric.findByIdAndUpdate(
      id,
      { $inc: { votes: delta || 1 } },
      { new: true }
    );

    if (!lyric) {
      return res.status(404).json({ message: "Lyric not found" });
    }

    res.json(lyric);
  } catch (err) {
    console.error("Error voting lyric:", err);
    res.status(500).json({ message: "Failed to vote lyric" });
  }
};
