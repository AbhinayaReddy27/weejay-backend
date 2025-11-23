const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    lines: { type: [String], required: true },
  },
  { _id: false }
);

const songSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    sections: {
      type: [sectionSchema],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    bpm: {
      type: Number,
      default: null,
    },
    genre: {
      type: String,
      default: null,
    },
    topLyrics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lyric",
      },
    ],
    topVibes: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);
