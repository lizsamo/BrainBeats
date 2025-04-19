const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { PythonShell } = require("python-shell");

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

  console.log("📥 File uploaded:", file.originalname);
  console.log("📂 File path (original):", file.path);

  const extension = path.extname(file.originalname);
  const renamedPath = `${file.path}${extension}`;

  try {
    fs.renameSync(file.path, renamedPath);
    console.log("📁 Renamed file path:", renamedPath);
  } catch (err) {
    console.error("❌ Rename Error:", err);
    return res.status(500).json({ error: "Rename failed" });
  }

  console.log("🚀 Spawning PythonShell...");
  let extractedText = "";

  const pyShell = new PythonShell("preprocessing_text.py", {
    args: [renamedPath],
    pythonOptions: ["-u"],
    mode: "text",
    encoding: "utf8", // ✅ Ensures correct decoding
  });
  

  pyShell.on("message", (message) => {
    extractedText += message + "\n";
  });

  pyShell.end((err) => {
    console.log("📬 PythonShell finished.");

    if (err) {
      console.error("❌ PythonShell Error:", err);
      return res.status(500).json({ error: "Text extraction failed." });
    }

    const text = extractedText.trim();
    console.log("✅ Final extracted text:\n", text);

    res.json({ text: text.length > 0 ? text : "⚠️ No text extracted." });

    fs.unlink(renamedPath, () => {});
  });
});

// Lyric generation route
app.post("/generate", (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "No prompt provided" });
  }

  console.log("📝 Prompt received for lyric generation:", prompt);

  PythonShell.run("neo.py", {
    args: [prompt],
    pythonOptions: ["-u"],
    mode: "text",
  }, (err, results) => {
    console.log("📬 Returned from GPT-Neo");

    if (err) {
      console.error("❌ GPT-Neo Error:", err);
      return res.status(500).json({ error: "Lyric generation failed" });
    }

    console.log("📦 Raw GPT-Neo output:", results);

    const lyrics = results.join("\n").trim();
    console.log("🎤 Generated Lyrics:\n", lyrics);

    res.json({ lyrics });
  });
});

app.listen(port, () => {
  console.log(`🎶 BrainBeats backend running → http://localhost:${port}`);
});
