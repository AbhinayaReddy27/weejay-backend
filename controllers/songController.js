const Session = require("../models/Session");
const Lyric = require("../models/Lyric");
const Vibe = require("../models/Vibe");
const Song = require("../models/Song");
const { getSessionAnalytics } = require("../services/analyticsService");
const { generateSongFromSession } = require("../services/songService");

exports.generateSongForSession = async (req, res) => {
  try {
    const { sessionCode } = req.body;

    const session = await Session.findOne({ sessionCode }).lean();
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const [lyrics, vibes, analytics] = await Promise.all([
      Lyric.find({ sessionCode }).lean(),
      Vibe.find({ sessionCode }).lean(),
      getSessionAnalytics(sessionCode),
    ]);

    const songPayload = await generateSongFromSession(
      session,
      lyrics,
      vibes,
      analytics
    );

    const saved = await Song.create({
      sessionCode,
      title: songPayload.title,
      sections: songPayload.sections,
      description: songPayload.description,
      bpm: songPayload.bpm,
      genre: songPayload.genre,
      topLyrics: songPayload.topLyricIds || [],
      topVibes: songPayload.topVibes || [],
    });

    if (songPayload.topLyricIds && songPayload.topLyricIds.length > 0) {
      await Lyric.updateMany(
        { _id: { $in: songPayload.topLyricIds } },
        { $set: { usedInSong: true } }
      );
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error generating song:", err);
    res.status(500).json({ message: "Failed to generate song" });
  }
};
