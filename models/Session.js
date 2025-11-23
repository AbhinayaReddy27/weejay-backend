const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    bpmPreset: {
      type: String,
      default: "medium",
    },
    genre: {
      type: String,
      default: "EDM / Pop",
    },
    bpm: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
