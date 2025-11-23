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

// ✅ Render will set this
const PORT = process.env.PORT || 5000;

// ✅ IMPORTANT: only take from env (no localhost default)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is missing in environment variables!");
  process.exit(1);
}

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
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
