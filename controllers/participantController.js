const Participant = require("../models/Participant");

exports.listForSession = async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const participants = await Participant.find({ sessionCode }).lean();
    res.json(participants);
  } catch (err) {
    console.error("Error loading participants:", err);
    res.status(500).json({ message: "Failed to load participants" });
  }
};
