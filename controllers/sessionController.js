const Session = require("../models/Session");
const Participant = require("../models/Participant");
const Lyric = require("../models/Lyric");
const Vibe = require("../models/Vibe");
const generateSessionCode = require("../utils/generateSessionCode");

exports.createSession = async (req, res) => {
  try {
    const { hostName, bpmPreset, genre } = req.body || {};

    if (!hostName) {
      return res.status(400).json({ message: "hostName is required" });
    }

    const sessionCode = generateSessionCode();

    const session = await Session.create({
      hostName,
      sessionCode,
      bpmPreset: bpmPreset || "medium",
      bpm: null,
      genre: genre || "EDM / Pop",
    });

    return res.status(201).json(session);
  } catch (err) {
    console.error("Error creating session:", err);
    res
      .status(500)
      .json({ message: "Failed to create session", error: err.message });
  }
};

exports.getSessionByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const session = await Session.findOne({ sessionCode: code }).lean();
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const [lyrics, vibes, participants] = await Promise.all([
      Lyric.find({ sessionCode: code }).lean(),
      Vibe.find({ sessionCode: code }).lean(),
      Participant.find({ sessionCode: code }).lean(),
    ]);

    res.json({
      session,
      lyrics,
      vibes,
      participants,
    });
  } catch (err) {
    console.error("Error loading session:", err);
    res.status(500).json({ message: "Failed to load session" });
  }
};

exports.joinSession = async (req, res) => {
  try {
    const { code } = req.params;
    const { name, role } = req.body;

    const session = await Session.findOne({ sessionCode: code });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const participant = await Participant.create({
      sessionCode: code,
      name: name || "Participant",
      role: role || "fan",
    });

    res.status(201).json(participant);
  } catch (err) {
    console.error("Error joining session:", err);
    res.status(500).json({ message: "Failed to join session" });
  }
};
