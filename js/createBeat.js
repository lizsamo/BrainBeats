let quill;
window.addEventListener("DOMContentLoaded", () => {
  quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Upload a file to see extracted content here...",
  });
});

document.getElementById("saveBtn")?.addEventListener("click", () => {
  alert("Your beat has been saved!");
  markComplete("💾 Save Beat");
});

document.getElementById("fileUpload")?.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  markComplete("📄 Upload Study Material");

  if (file) {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      document.getElementById("loadingOverlay").style.display = "flex";

      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text.trim().length > 0) {
          const formatted = data.text
            .split(/[\n\r]+|[.,]+/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join("\n");

          quill.setText(formatted + "\n");
<<<<<<< HEAD
=======

>>>>>>> e6c295887b41e72fb4cf72b1237ef84cd0616169
          document.getElementById("highlightDropdown").setAttribute("open", true);
          markComplete("📝 Highlight Text for Lyrics");
        } else {
          quill.setText("⚠️ No text was extracted from the uploaded file.");
        }

        document.querySelector("#editor").scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Upload failed.");
      }

      document.getElementById("loadingOverlay").style.display = "none";
    } catch (err) {
      document.getElementById("loadingOverlay").style.display = "none";
      console.error("❌ Upload error:", err);
    }
  }
});

document.getElementById("generateBtn")?.addEventListener("click", async () => {
  const selection = quill.getSelection();
  if (!selection || selection.length === 0) {
    alert("Please highlight text to generate lyrics.");
    return;
  }

<<<<<<< HEAD
=======
  document.getElementById("lyricsContainer").style.display = "none";

>>>>>>> e6c295887b41e72fb4cf72b1237ef84cd0616169
  const prompt = quill.getText(selection.index, selection.length);
  document.getElementById("lyricsContainer").style.display = "none";
  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (data.lyrics) {
      document.getElementById("lyricsOutput").textContent = data.lyrics;
      document.getElementById("lyricsContainer").style.display = "block";
      document.getElementById("lyricsContainer").scrollIntoView({ behavior: "smooth" });
    } else {
      alert("No lyrics were returned.");
    }

    markComplete("📝 Highlight Text for Lyrics");
    document.querySelectorAll("details").forEach((el) => {
      const label = el.querySelector("summary")?.textContent.trim();
      if (label === "🎼 Pick Music") el.setAttribute("open", true);
    });

  } catch (err) {
    console.error("❌ Error generating lyrics:", err);
    alert("Something went wrong.");
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
});

document.getElementById("generateSongBtn")?.addEventListener("click", async () => {
  const lyrics = document.getElementById("lyricsOutput").textContent.trim();
  //const voice = document.getElementById("voiceSelect").value;
  const genre = document.getElementById("genreSelect").value;

  if (!lyrics) {
    alert("Please generate lyrics first.");
    return;
  }

  document.getElementById("loadingOverlay").style.display = "flex";

  try {
    const response = await fetch("/generate-full-song", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics, genre })
    });

    const data = await response.json();

    if (data.audioUrl) {
      const audio = document.getElementById("finalPlayer");
      audio.src = data.audioUrl;
      audio.style.display = "block";
      audio.play();
      
      const downloadLink = document.getElementById("downloadLink");
      downloadLink.href = data.audioUrl;
      downloadLink.download = `brainbeat-${genre}.mp3`;
      downloadLink.style.display = "inline-block";
      
      markComplete("💾 Save Music");
      
    } else {
      alert("Failed to generate the full song.");
    }
  } catch (err) {
    console.error("❌ Full song generation failed:", err);
    alert("Something went wrong.");
  } finally {
    document.getElementById("loadingOverlay").style.display = "none";
  }
});

function markComplete(label) {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    const summaryText = dropdown.querySelector("summary").textContent.trim();
    if (summaryText === label) {
      dropdown.classList.add("completed");
    }
  });
}

// 🎵 Request music from TopMedi
async function requestMusicFromTopMedi(genre) {
  try {
    const response = await fetch("/generate-music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ genre}),
    });

    const data = await response.json();

    if (data.music_url) {
      const player = document.getElementById("musicPlayer");
      const container = document.getElementById("musicPlayerContainer");

      player.src = data.music_url;
      container.style.display = "block";
      player.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("⚠️ Music was not returned from TopMedi.");
    }
  } catch (err) {
    console.error("🎵 Music generation failed:", err);
    alert("Something went wrong while generating the music.");
  }
}
// Add event listeners to the genre buttons
const genreButtons = document.querySelectorAll('.genreBtn');
genreButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const genre = event.target.textContent; // Get the genre from the button text
    requestMusicFromTopMedi(genre);  // Request music for that genre
  });
});
