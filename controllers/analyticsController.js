const { getSessionAnalytics } = require("../services/analyticsService");

exports.getSessionAnalytics = async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const analytics = await getSessionAnalytics(sessionCode);
    res.json(analytics);
  } catch (err) {
    console.error("Error computing analytics:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
