const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const sessionRoutes = require("./routes/sessionRoutes");
const lyricRoutes = require("./routes/lyricRoutes");
const vibeRoutes = require("./routes/vibeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const participantRoutes = require("./routes/participantRoutes");
const songRoutes = require("./routes/songRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/weejay_db";

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/sessions", sessionRoutes);
app.use("/api/lyrics", lyricRoutes);
app.use("/api/vibes", vibeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/songs", songRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Backend listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
