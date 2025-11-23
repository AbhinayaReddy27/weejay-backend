const mongoose = require("mongoose");

const lyricSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      index: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: false,
    },
    text: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    usedInSong: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lyric", lyricSchema);
