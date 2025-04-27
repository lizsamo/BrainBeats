//b_createBeat.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PythonShell } = require("python-shell");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const router = express.Router();
const upload = multer({ dest: "uploads/" });
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Upload and extract
router.post("/upload", upload.single("uploadedFile"), (req, res) => {
  console.log("📁 /upload route hit");

  const file = req.file;
  if (!file) {
    console.error("❌ No file received in request.");
    return res.status(400).json({ error: "No file uploaded." });
  }

  const extension = path.extname(file.originalname);
  const renamedPath = `${file.path}${extension}`;
  try {
    fs.renameSync(file.path, renamedPath);
    console.log(`📦 File renamed to: ${renamedPath}`);
  } catch (renameErr) {
    console.error("❌ File rename failed:", renameErr);
    return res.status(500).json({ error: "Rename failed" });
  }

  let extractedText = "";
  const pyShell = new PythonShell("preprocessing_text.py", {
    args: [renamedPath],
    pythonOptions: ["-u"],
    mode: "text",
    encoding: "utf8",
  });

  pyShell.on("message", (msg) => {
    console.log("🐍 PythonShell message:", msg);
    extractedText += msg + "\n";
  });

  pyShell.end((err) => {
    fs.unlink(renamedPath, () => {
      console.log(`🧹 Temp file deleted: ${renamedPath}`);
    });

    if (err) {
      console.error("❌ PythonShell error:", err);
      return res.status(500).json({ error: "Text extraction failed." });
    }

    console.log("✅ Text extracted successfully.");
    res.json({ text: extractedText.trim() || "⚠️ No text extracted." });
  });
});

// Lyric Generation
router.post("/generate", async (req, res) => {
  console.log("🎤 /generate route hit");

  const { prompt } = req.body;
  console.log("📝 Prompt received:", prompt);

  if (!prompt?.trim()) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI that writes fun, rhyming educational lyrics." },
          { role: "user", content: `Turn the following into an educational rhyme:\n\n${prompt}` }
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    const result = await response.json();
    console.log("🧠 OpenAI API response:", result);

    const lyrics = result.choices?.[0]?.message?.content;
    if (!lyrics) {
      return res.status(500).json({ error: "No lyrics returned", raw: result });
    }

    res.json({ lyrics: lyrics.trim() });
  } catch (err) {
    console.error("❌ Lyric generation failed:", err);
    res.status(500).json({ error: "Lyric generation failed", message: err.message });
  }
});

// Full Song Generation
router.post("/generate-full-song", async (req, res) => {
  console.log("🎶 /generate-full-song hit");

  const { lyrics, genre } = req.body;
  if (!lyrics || !genre) return res.status(400).json({ error: "Missing lyrics or genre." });

  const genrePrompts = {
    pop: "Catchy pop style", edm: "Electronic dance beat", hiphop: "Energetic hip-hop flow",
    rock: "Strong electric guitar rhythm", lofi: "Relaxed lo-fi instrumental",
    country: "Storytelling country feel", jazz: "Smooth jazz improvisation",
    classical: "Orchestral theme", reggae: "Island-style groove", rnb: "Soulful R&B vibe"
  };

  const prompt = genrePrompts[genre.toLowerCase()] || "Fun educational style";
  const title = `BrainBeat - ${genre.charAt(0).toUpperCase() + genre.slice(1)}`;

  console.log("📤 Submitting song to TopMediai:", { prompt, lyrics, title });

  const submission = await fetch("https://api.topmediai.com/v2/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.TOPMEDIAI_API_KEY
    },
    body: JSON.stringify({
      is_auto: 0, custom: 1, prompt, lyrics, title,
      instrumental: 0, model_version: "v3.5", continue_at: 0, continue_song_id: ""
    }),
  });

  const submissionResult = await submission.json();
  const songId = submissionResult?.data?.[0]?.song_id;
  if (!songId) {
    return res.status(500).json({ error: "Failed to get song ID", details: submissionResult });
  }

  console.log("🎵 Song submitted successfully. Song ID:", songId);

  // Polling loop
  let tries = 0;
  let finalSongData = null;

  while (tries++ < 10) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const statusRes = await fetch(`https://api.topmediai.com/v2/query?song_id=${songId}`, {
      headers: { "x-api-key": process.env.TOPMEDIAI_API_KEY }
    });
    const result = await statusRes.json();

    const songData = Array.isArray(result?.data) ? result.data[0] : result?.data;
    const status = songData?.status?.toUpperCase();

    console.log(`🔁 Polling (${tries}/10): Status = ${status}`);

    if (
      status === "FINISHED" ||
      (songData?.audio && songData?.audio_duration !== -1)
    ) {
      finalSongData = songData;
      break;
    }
  }

  if (!finalSongData?.audio) {
    console.error("❌ Song generation stuck or incomplete.");
    return res.status(504).json({
      error: "⏳ Song is still generating. Please click 'Generate Full Song' again.",
      song_id: songId
    });
  }

  console.log("✅ Song ready:", finalSongData.audio);
  res.json({ audioUrl: finalSongData.audio });
});

module.exports = router;
