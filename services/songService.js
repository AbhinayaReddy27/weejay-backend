// weejay-backend/services/songService.js

let OpenAI = null;

try {
  OpenAI = require("openai");
} catch (err) {
  console.warn("OpenAI SDK not installed – will use dummy song output.");
}

// Build prompt for real LLM call (if key is present)
function buildPrompt(session, lyrics, vibes, analytics) {
  const topLines = [...lyrics]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 4)
    .map((l) => `- ${l.text} (votes: ${l.votes || 0})`)
    .join("\n");

  const vibeWords = vibes.map((v) => v.value).join(", ");

  return `
You are an AI songwriter helping a live crowd + host write a track.

Host settings:
- BPM preset: ${session.bpmPreset || "Medium"}
- Genre: ${session.genre || "Indie / Pop"}

Crowd inputs:
Top lyric ideas:
${topLines || "(no lyrics yet)"}

Vibe words: ${vibeWords || "(none)"}

Analytics summary:
- Total lyrics: ${analytics.totalLyrics}
- Total vibes: ${analytics.totalVibes}
- Top vibe: ${analytics.topVibe || "none"}

Write a structured song in this JSON format ONLY (no extra text):
{
  "title": "Song Title",
  "description": "1 short paragraph describing the song",
  "sections": [
    { "heading": "VERSE 1", "lines": ["line 1", "line 2", "..."] },
    { "heading": "CHORUS", "lines": ["line 1", "line 2", "..."] },
    { "heading": "VERSE 2", "lines": ["..."] },
    { "heading": "BRIDGE", "lines": ["..."] }
  ]
}
Use the crowd lyric ideas and vibe words inside the lines.
`.trim();
}

// Dummy “Glow of the Screen” song – always works
function buildDummySong(session, lyrics, vibes, analytics) {
  const title = "Glow of the Screen";
  const firstLine =
    analytics?.topLyricLine ||
    lyrics[0]?.text ||
    "We came together in the glow of the screen tonight";
  const topVibe = analytics?.topVibe || vibes[0]?.value || "hype";

  const bpm = 130;
  const genre = session.genre || "Hip-hop";

  const description =
    "A high-energy hip-hop track at 130 BPM that captures the hype and power of digital connection and collaborative creation. The song revolves around the vibrant imagery of neon-lit screens and dreams typed into a shared rhythm, inspired directly by the crowd's vivid lyric contributions and vibe suggestions.";

  const producerNotes =
    "Crowd leaned heavily toward " +
    topVibe +
    ", so this structure keeps the verses spacious and lets the hook carry the main emotion. Recommended: use tight drums, subtle side-chain compression to match the BPM, and tasteful reverb tails to preserve the late-night feel.";

  const styleSuggestion =
    "This track would fit best as a dreamy late-night synth-pop / hip-hop blend with warm pads, soft leads, and a driving but not overwhelming kick. Think neon city lights and highway reflections.";

  const socialCaption =
    '"Typed dreams, neon nights — created live with the crowd."';

  const remixSuggestion =
    "For a more energetic remix, push the BPM closer to 140, layer brighter synth leads, and emphasise vibes like 'neon' or 'energy' in the lyrics. For a softer version, reduce BPM slightly and lean into more dreamy or lo-fi textures.";

  const influenceSummary = {
    topVotedLyric: firstLine,
    mostCommonVibe: topVibe,
    bpm,
    genre,
    focusSignal: "Light",
  };

  return {
    title,
    description,
    sections: [
      {
        heading: "VERSE 1",
        lines: [
          firstLine,
          "Neon lights dancing on the words we write together",
          "Type your dreams into the feed, let the rhythm decide",
          "Power in the pulse, feel the hype ignite forever",
        ],
      },
      {
        heading: "CHORUS",
        lines: [
          "In the glow of the screen, we own the night",
          "Hyping up the vibe, electric and bright",
          "Together we rise, this moment's alive",
          "Type your dreams, let the rhythm drive",
        ],
      },
      {
        heading: "VERSE 2",
        lines: [
          "Scroll after scroll, see our stories align",
          "From a bedroom mic to a stadium sign",
          "Every little fire emoji keeps the tempo in time",
          "We are the crowd, turning comments into rhymes",
        ],
      },
      {
        heading: "BRIDGE",
        lines: [
          "Hands in the air for the lines that hit hardest",
          "Votes in the chat for the ones that move farthest",
          "AI on the aux but the feeling stays human",
          "In the glow of the screen, every voice keeps booming",
        ],
      },
    ],
    bpm,
    genre,
    topVibes: vibes.map((v) => v.value),
    producerNotes,
    styleSuggestion,
    socialCaption,
    emotionalToneLabel: "Energetic",
    emotionalToneScore: 70,
    remixSuggestion,
    influenceSummary,
  };
}

async function generateSongFromSession(session, lyrics, vibes, analytics) {
  const apiKey = process.env.AI_API_KEY;

  // If no key or SDK, ALWAYS use dummy song
  if (!apiKey || !OpenAI) {
    console.warn("No AI_API_KEY or OpenAI SDK – returning dummy song.");
    const dummy = buildDummySong(session, lyrics, vibes, analytics);
    return {
      ...dummy,
      topLyricIds: lyrics
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, 3)
        .map((l) => l._id),
    };
  }

  const client = new OpenAI({ apiKey }); // ✅ no baseURL override

  const prompt = buildPrompt(session, lyrics, vibes, analytics);

  try {
    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI songwriter that returns ONLY valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "";
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse AI JSON, falling back to dummy:", err);
      parsed = buildDummySong(session, lyrics, vibes, analytics);
    }

    const bpm = 130;
    const genre = session.genre || "Hip-hop";

    return {
      title: parsed.title || "Glow of the Screen",
      description: parsed.description || "",
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      bpm,
      genre,
      topLyricIds: lyrics
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, 3)
        .map((l) => l._id),
      topVibes: vibes.map((v) => v.value),
      producerNotes:
        parsed.producerNotes ||
        "Crowd-leaning structure that keeps verses open and the hook carrying the main emotion.",
      styleSuggestion:
        parsed.styleSuggestion ||
        "Dreamy late-night synth-pop / hip-hop blend with warm pads and neon textures.",
      socialCaption:
        parsed.socialCaption ||
        '"Typed dreams, neon nights — created live with the crowd."',
      emotionalToneLabel: "Energetic",
      emotionalToneScore: 70,
      remixSuggestion:
        parsed.remixSuggestion ||
        "For a more energetic remix, push BPM higher and emphasise brighter synths and high-energy lyrics.",
      influenceSummary: {
        topVotedLyric: analytics.topLyricLine,
        mostCommonVibe: analytics.topVibe,
        bpm,
        genre,
        focusSignal: "Light",
      },
    };
  } catch (err) {
    // ❗ Any OpenAI error → log + dummy song, not a crash
    console.error("OpenAI error, falling back to dummy song:", err);
    const dummy = buildDummySong(session, lyrics, vibes, analytics);
    return {
      ...dummy,
      topLyricIds: lyrics
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, 3)
        .map((l) => l._id),
    };
  }
}

module.exports = {
  generateSongFromSession,
};
