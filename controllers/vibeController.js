const Vibe = require("../models/Vibe");

exports.createVibe = async (req, res) => {
  try {
    const { sessionCode, participantId, value } = req.body;

    const vibe = await Vibe.create({
      sessionCode,
      participantId: participantId || null,
      value,
    });

    res.status(201).json(vibe);
  } catch (err) {
    console.error("Error creating vibe:", err);
    res.status(500).json({ message: "Failed to create vibe" });
  }
};
