let quill;
window.addEventListener("DOMContentLoaded", () => {
  quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Upload a file to see extracted content here...",
  });
});

// Upload and extract text
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
          document.getElementById("highlightDropdown").setAttribute("open", true);
          markComplete("📝 Highlight Text for Lyrics");
        } else {
          quill.setText("⚠️ No text was extracted from the uploaded file.");
        }

        document.querySelector("#editor").scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Upload failed.");
      }

    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Something went wrong while uploading the file.");
    } finally {
      document.getElementById("loadingOverlay").style.display = "none";
    }
  }
});

// Generate Lyrics
document.getElementById("generateBtn")?.addEventListener("click", async () => {
  const selection = quill.getSelection();
  if (!selection || selection.length === 0) {
    alert("Please highlight text to generate lyrics.");
    return;
  }

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

// Generate Full Song
document.getElementById("generateSongBtn")?.addEventListener("click", async () => {
  const lyrics = document.getElementById("lyricsOutput").textContent.trim();
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

    if (response.status === 504) {
      alert("⏳ Song is still generating. Try clicking 'Generate Full Song' again in a few seconds.");
      return;
    }

    if (!response.ok) {
      alert("🚫 Failed to generate the full song. Please try again later.");
      return;
    }

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

      // 🚀 Save song info to the database using JWT token
      const token = localStorage.getItem('jwtToken');
      const title = `BrainBeat - ${genre.charAt(0).toUpperCase() + genre.slice(1)}`;
      const filePath = data.audioUrl;

      if (token) {
        fetch("/save-song", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ title, filePath }),
        })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            console.log("✅ Song saved successfully!");
          } else {
            console.error("❌ Failed to save song:", result.error);
          }
        })
        .catch(error => {
          console.error("❌ Error saving song:", error);
        });
      } else {
        console.warn("⚠️ No JWT token found. Please log in again.");
      }

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

// Helper function to mark completion
function markComplete(label) {
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    const summaryText = dropdown.querySelector("summary")?.textContent.trim();
    if (summaryText === label) {
      dropdown.classList.add("completed");
    }
  });
}
