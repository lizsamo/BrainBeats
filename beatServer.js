const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load environment variables

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "createBeat.html"));
});

const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Upload route: Extract text
app.post("/upload", upload.single("uploadedFile"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const extension = path.extname(file.originalname);
  const renamedPath = `${file.path}${extension}`;

  try {
    fs.renameSync(file.path, renamedPath);
  } catch (err) {
    return res.status(500).json({ error: "Rename failed" });
  }

  let extractedText = "";
  const { PythonShell } = require("python-shell");

  const pyShell = new PythonShell("preprocessing_text.py", {
    args: [renamedPath],
    pythonOptions: ["-u"],
    mode: "text",
    encoding: "utf8",
  });

  pyShell.on("message", (message) => {
    extractedText += message + "\n";
  });

  pyShell.end((err) => {
    if (err) {
      return res.status(500).json({ error: "Text extraction failed." });
    }

    const text = extractedText.trim();
    res.json({ text: text.length > 0 ? text : "⚠️ No text extracted." });

    fs.unlink(renamedPath, () => {});
  });
});

// Lyric generation using GPT-3.5 Turbo
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "No prompt provided" });
  }

  console.log("📝 Prompt received for lyric generation:", prompt);

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
          {
            role: "system",
            content: "You are an AI that generates short, rhyming educational lyrics to help students study.",
          },
          {
            role: "user",
            content: `Turn the following concepts into a short 4–6 line educational song or rhyme. Make it fun, easy to remember, and accurate:\n\n${prompt}`,
          },
        ],
        temperature: 0.9,
        max_tokens: 200,
      }),
    });

    const result = await response.json();
    const lyrics = result.choices?.[0]?.message?.content || "[No lyrics returned]";

    console.log("🎤 Generated Lyrics:\n", lyrics);
    res.json({ lyrics: lyrics.trim() });

  } catch (err) {
    console.error("❌ OpenAI generation error:", err);
    res.status(500).json({ error: "Lyric generation failed" });
  }
});
async function generateMusicFromTopMedi(genre) {
  console.log("🎧 [MOCK] Pretending to generate music for:", genre);
  return {
    music_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  };
}


// Music generation using TopMedi
app.post("/generate-music", async (req, res) => {
  const { genre } = req.body;

  if (!genre) {
    return res.status(400).json({ error: "Genre is required" });
  }

  try {
    console.log(`🎵 Generating music for genre: ${genre}`); // Log genre
    // Call TopMedi API to generate music based on the genre
    const musicData = await generateMusicFromTopMedi(genre); // Your function for calling TopMedi

    console.log("🎶 Music data received:", musicData); // Log TopMedi response

    if (musicData && musicData.music_url) {
      res.json({ music_url: musicData.music_url });
    } else {
      res.status(500).json({ error: "Music not returned from TopMedi" });
    }
  } catch (err) {
    console.error("❌ Error generating music:", err);
    res.status(500).json({ error: "Failed to generate music" });
  }
});
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
