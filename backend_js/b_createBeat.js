// b_createBeat.js

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PythonShell } = require("python-shell");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { pool } = require("../db");
const authenticateToken = require("./authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Upload and extract text
router.post("/upload", upload.single("uploadedFile"), (req, res) => {
  console.log("📁 /upload route hit");

  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded." });

  const extension = path.extname(file.originalname);
  const renamedPath = `${file.path}${extension}`;
  try {
    fs.renameSync(file.path, renamedPath);
    console.log(`📦 File renamed: ${renamedPath}`);
  } catch (err) {
    console.error("❌ Rename failed:", err);
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
    console.log("🐍 PythonShell:", msg);
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

// Generate lyrics
router.post("/generate", async (req, res) => {
  console.log("🎤 /generate route hit");
  const { prompt } = req.body;

  if (!prompt?.trim()) return res.status(400).json({ error: "No prompt provided" });

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
          { role: "user", content: `Turn the following into an educational rhyme:\n\n${prompt}` },
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    const result = await response.json();
    const lyrics = result.choices?.[0]?.message?.content;

    if (!lyrics) return res.status(500).json({ error: "No lyrics returned", raw: result });

    res.json({ lyrics: lyrics.trim() });
  } catch (err) {
    console.error("❌ Lyric generation error:", err);
    res.status(500).json({ error: "Lyric generation failed", message: err.message });
  }
});

// Generate full song
router.post("/generate-full-song", async (req, res) => {
  console.log("🎶 /generate-full-song route hit");
  const { lyrics, genre } = req.body;

  if (!lyrics || !genre) return res.status(400).json({ error: "Missing lyrics or genre." });

  const genrePrompts = {
    pop: "Catchy pop style", edm: "Electronic dance beat", hiphop: "Energetic hip-hop flow",
    rock: "Strong electric guitar rhythm", lofi: "Relaxed lo-fi instrumental",
    country: "Storytelling country feel", jazz: "Smooth jazz improvisation",
    classical: "Orchestral theme", reggae: "Island-style groove", rnb: "Soulful R&B vibe",
  };

  const prompt = `${genrePrompts[genre.toLowerCase()] || "Fun educational style"} Keep it short, around 60 seconds.`;
  const title = `BrainBeat - ${genre.charAt(0).toUpperCase() + genre.slice(1)}`;

  try {
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

    if (!songId) return res.status(500).json({ error: "Failed to get song ID", details: submissionResult });

    console.log("🎵 Song submitted. ID:", songId);

    // Poll for audio completion
    let tries = 0;
    let finalSongData = null;

    while (tries++ < 25) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const statusRes = await fetch(`https://api.topmediai.com/v2/query?song_id=${songId}`, {
        headers: { "x-api-key": process.env.TOPMEDIAI_API_KEY }
      });
      const result = await statusRes.json();
      const songData = Array.isArray(result?.data) ? result.data[0] : result?.data;
      const status = songData?.status?.toUpperCase();
      console.log(`🔁 Polling attempt ${tries}: Status = ${status}`);
      console.log("🔍 Polling result raw:", JSON.stringify(result));


      if (
        status === "FINISHED" ||
        (songData?.audio && songData?.audio.includes("http"))
      ) {
        finalSongData = songData;
        break;
      }
      
    }

    if (!finalSongData?.audio) {
      console.error("❌ Song generation timeout or failed.");
      return res.status(504).json({ error: "Song still generating, please retry." });
    }

    console.log("✅ Song ready:", finalSongData.audio);
    res.json({ audioUrl: finalSongData.audio });

  } catch (err) {
    console.error("❌ Error during song generation:", err);
    res.status(500).json({ error: "Failed to generate song." });
  }
});

// ✅ SECURE: Save song using user ID from JWT
router.post("/save-song", authenticateToken, async (req, res) => {
  console.log("💾 /save-song route hit");

  const { title, filePath } = req.body;
  const userId = req.user.userId;

  if (!title || !filePath) {
    return res.status(400).json({ error: "Missing title or file path." });
  }

  try {

    const insertResult = await pool.query(
      `INSERT INTO generated_songs (user_id, title, file_path, created_at, is_private)
       VALUES ($1, $2, $3, NOW(), false) RETURNING *`,
      [userId, title, filePath]
    );
    
    console.log("🎵 DB insert result:", insertResult.rows[0]);
    
    console.log(`✅ Song saved for user_id: ${userId}`);
    res.json({ success: true, message: "Song saved successfully!" });

  } catch (err) {
    console.error("❌ Error saving song:", err.message);
    res.status(500).json({ error: "Failed to save song." });
  }
});

module.exports = router;
