const Lyric = require("../models/Lyric");
const Vibe = require("../models/Vibe");
const Participant = require("../models/Participant");

function computeContributionScore(stats) {
  const { lyricCount = 0, vibeCount = 0, totalVotes = 0 } = stats;
  return lyricCount * 2 + vibeCount * 1 + totalVotes * 0.5;
}

function getTopLyricLine(lyrics) {
  if (!lyrics || lyrics.length === 0) return null;

  let top = null;
  let maxVotes = -1;

  for (const l of lyrics) {
    const votes = Number(l.votes || 0);
    if (votes > maxVotes) {
      maxVotes = votes;
      top = l.text || l.content || null;
    }
  }

  return top;
}

function getTopVibe(vibes) {
  if (!vibes || vibes.length === 0) return null;

  const counts = new Map();

  for (const v of vibes) {
    const key =
      v.value || v.text || v.label || v.word || v.vibe || null;
    if (!key) continue;

    const current = counts.get(key) || 0;
    const inc = typeof v.count === "number" ? v.count : 1;
    counts.set(key, current + inc);
  }

  if (counts.size === 0) return null;

  let topKey = null;
  let maxCount = -1;

  for (const [k, c] of counts.entries()) {
    if (c > maxCount) {
      maxCount = c;
      topKey = k;
    }
  }

  return topKey;
}

async function getSessionAnalytics(sessionCode) {
  if (!sessionCode) {
    return {
      totalLyrics: 0,
      totalVibes: 0,
      uniqueContributors: 0,
      topContributors: [],
      topLyricLine: null,
      topVibe: null,
      totalVotesAcrossLyrics: 0,
    };
  }

  const [lyrics, vibes, participants] = await Promise.all([
    Lyric.find({ sessionCode })
      .populate("participant", "name role")
      .lean(),
    Vibe.find({ sessionCode }).lean(),
    Participant.find({ sessionCode }).lean(),
  ]);

  const contributions = new Map();

  function ensureStats(id, name = "Anonymous") {
    if (!id) return null;
    if (!contributions.has(id)) {
      contributions.set(id, {
        participantId: id,
        name,
        lyricCount: 0,
        vibeCount: 0,
        totalVotes: 0,
        score: 0,
      });
    }
    return contributions.get(id);
  }

  let totalVotesAcrossLyrics = 0;

  for (const l of lyrics) {
    if (!l.participant?._id) continue;
    const stats = ensureStats(l.participant._id.toString(), l.participant.name);
    stats.lyricCount += 1;
    const votes = Number(l.votes || 0);
    stats.totalVotes += votes;
    totalVotesAcrossLyrics += votes;
  }

  for (const v of vibes) {
    if (!v.participantId) continue;
    const stats = ensureStats(v.participantId.toString());
    stats.vibeCount += v.count || 1;
  }

  for (const p of participants) {
    ensureStats(p._id.toString(), p.name);
  }

  for (const stats of contributions.values()) {
    stats.score = computeContributionScore(stats);
  }

  const topContributors = Array.from(contributions.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topLyricLine = getTopLyricLine(lyrics);
  const topVibe = getTopVibe(vibes);

  return {
    totalLyrics: lyrics.length,
    totalVibes: vibes.length,
    uniqueContributors: contributions.size,
    topContributors,
    topLyricLine,
    topVibe,
    totalVotesAcrossLyrics,
  };
}

module.exports = {
  getSessionAnalytics,
  computeContributionScore,
};
