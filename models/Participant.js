const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "Participant",
    },
    role: {
      type: String,
      enum: ["fan", "superfan", "vip"],
      default: "fan",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Participant", participantSchema);
