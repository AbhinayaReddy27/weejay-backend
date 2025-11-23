const mongoose = require("mongoose");

const vibeSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      index: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: false,
    },
    value: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vibe", vibeSchema);
