const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
//console.log("🔐 Loaded TopMediai Key:", process.env.TOPMEDIAI_API_KEY);

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "createBeat.html"));
});

const upload = multer({ dest: "uploads/" });
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.post("/upload", upload.single("uploadedFile"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded." });

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
    if (err) return res.status(500).json({ error: "Text extraction failed." });
    const text = extractedText.trim();
    res.json({ text: text.length > 0 ? text : "⚠️ No text extracted." });
    fs.unlink(renamedPath, () => {});
  });
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || prompt.trim() === "") return res.status(400).json({ error: "No prompt provided" });

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

// app.post("/generate-vocals", async (req, res) => {
//   const { voice, lyrics } = req.body;
//   if (!voice || !lyrics) return res.status(400).json({ error: "Missing voice or lyrics." });

//   const speakerMap = {
//     female: "b27c1f98-1ef0-11ef-9faa-00163e045692", // Hannah
//     male: "00151554-3826-11ee-a861-00163e2ac61b"   // Brian
//   };

//   const speakerId = speakerMap[voice] || speakerMap["male"];

//   const payload = {
//     text: lyrics,
//     speaker: speakerId,
//     emotion: "Neutral"
//   };

//   try {
//     console.log("📤 Sending to TopMediai:", payload);

//     const response = await fetch("https://api.topmediai.com/v1/text2speech", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": process.env.TOPMEDIAI_API_KEY
//       },
//       body: JSON.stringify(payload)
//     });

//     const result = await response.json();
//     const audioUrl = result?.data?.oss_url;

//     if (!response.ok || !audioUrl) {
//       return res.status(response.status).json({
//         error: result?.message || "Topmediai API error",
//         details: result
//       });
//     }

//     res.json({ audioUrl });

//   } catch (error) {
//     console.error("❌ Vocal generation error:", error);
//     res.status(500).json({ error: "Vocal generation failed (server error)." });
//   }
// });

//song generation route
app.post("/generate-full-song", async (req, res) => {
  const { lyrics, genre } = req.body;

  if (!lyrics || !genre) {
    return res.status(400).json({ error: "Missing lyrics or genre." });
  }

  console.log("🎶 /generate-full-song hit");
  console.log("🎤 Using these GPT-3.5 lyrics:", lyrics);
  console.log("🎼 Genre:", genre);
  //console.log("🧑‍🎤 Voice:", voice);

  const genrePrompts = {
    pop: "Catchy pop style",
    edm: "Electronic dance beat",
    hiphop: "Energetic hip-hop flow",
    rock: "Strong electric guitar rhythm",
    lofi: "Relaxed lo-fi instrumental",
    country: "Storytelling country feel",
    jazz: "Smooth jazz improvisation",
    classical: "Orchestral theme",
    reggae: "Island-style groove",
    rnb: "Soulful R&B vibe"
  };

  const prompt = genrePrompts[genre.toLowerCase()] || "Fun educational style";
  const title = `BrainBeat - ${genre.charAt(0).toUpperCase() + genre.slice(1)}`;

  console.log("📤 Full payload sent to TopMediai:", {
    is_auto: 0,
    custom: 1,
    prompt,
    lyrics,
    title,
    instrumental: 0,
    model_version: "v3.5",
    continue_at: 0,
    continue_song_id: ""
  });
  


  const submission = await fetch("https://api.topmediai.com/v2/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.TOPMEDIAI_API_KEY
    },
    body: JSON.stringify({
      is_auto: 0,
      custom: 1,
      prompt,
      lyrics,
      title,
      instrumental: 0,
      model_version: "v3.5",
      continue_at: 0,
      continue_song_id: ""
    })
    
  });

  const submissionResult = await submission.json();
  const songEntry = submissionResult?.data?.[0];
  const songId = songEntry?.song_id;


  if (!songId) {
    console.error("❌ Failed to get song ID:", submissionResult);
    return res.status(500).json({ error: "Failed to get song ID", details: submissionResult });
  }

  console.log("🎵 Submitted! Song ID:", songId);


  const maxTries = 10;
  let tries = 0;
  let finalResult;

  while (tries < maxTries) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const query = await fetch(`https://api.topmediai.com/v2/query?song_id=${songId}`, {
      headers: { "x-api-key": process.env.TOPMEDIAI_API_KEY }
    });

    const result = await query.json();
    const status = result?.data?.status || result?.status;


    console.log(`🔁 Polling... (${tries + 1}/${maxTries}) Status:`, status);

    if (status === "complete") {
      finalResult = result;
      break;
    }

    tries++;
  }

  const audioUrl = songEntry?.audio || songEntry?.audio_url || songEntry?.oss_url;
  if (!audioUrl) {
    return res.status(500).json({ error: "Song generation did not complete", result: finalResult });
  }

  console.log("✅ Song ready:", audioUrl);
  res.json({ audioUrl });
});

app.listen(port, () => {
  console.log(`🎶 BrainBeats backend running → http://localhost:${port}`);
});
