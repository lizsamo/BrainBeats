let quill;
window.addEventListener("DOMContentLoaded", () => {
  quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Upload a file to see extracted content here...",
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
      // Step 1: Submit song generation request
      const res = await fetch("/generate-full-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics, genre })
      });
  
      const { songId } = await res.json();
      if (!songId) throw new Error("No songId returned");
  
      // Step 2: Poll the server every 2s for audio status
      let tries = 0;
      const interval = setInterval(async () => {
        tries++;
        if (tries > 30) {
          clearInterval(interval);
          alert("⏳ Song took too long to generate. Try again.");
          document.getElementById("loadingOverlay").style.display = "none";
          return;
        }
  
        const checkRes = await fetch(`/check-song-status?songId=${songId}`);
        const data = await checkRes.json();
  
        if (data.done) {
          clearInterval(interval);
  
          // Play and display
          const audio = document.getElementById("finalPlayer");
          audio.src = data.audioUrl;
          audio.style.display = "block";
          audio.play();
  
          const downloadLink = document.getElementById("downloadLink");
          downloadLink.href = data.audioUrl;
          downloadLink.download = `brainbeat-${genre}.mp3`;
          downloadLink.style.display = "inline-block";
  
          markComplete("💾 Save Music");
          document.getElementById("postGenButtons").style.display = "flex";
  
          document.getElementById("loadingOverlay").style.display = "none";
  
          // Optional: auto-save song
          const email = localStorage.getItem("userEmail");
          const title = `BrainBeat - ${genre.charAt(0).toUpperCase() + genre.slice(1)}`;
          const filePath = data.audioUrl;
  
          if (email) {
            await fetch("/save-song", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, title, filePath }),
            });
          }
  
        }
      }, 2000);
  
    } catch (err) {
      console.error("❌ Song generation failed:", err);
      alert("Something went wrong.");
      document.getElementById("loadingOverlay").style.display = "none";
    }
  });
  

  // Save modal trigger
  document.getElementById("saveSongBtn")?.addEventListener("click", () => {
    document.getElementById("modalTitleInput").value = "";
    document.getElementById("titleModal").classList.remove("hidden");
  });

  document.getElementById("modalCancelBtn")?.addEventListener("click", () => {
    document.getElementById("titleModal").classList.add("hidden");
  });

  document.getElementById("modalSaveBtn")?.addEventListener("click", async () => {
    const genre = document.getElementById("genreSelect").value;
    const filePath = document.getElementById("downloadLink").href;
    const token = localStorage.getItem("jwtToken");
    const title = document.getElementById("modalTitleInput").value.trim();

    if (!title) {
      alert("Please enter a title.");
      return;
    }

    document.getElementById("titleModal").classList.add("hidden");

    console.log("Attempting to save:", { title, filePath, token });

    if (token) {
      try {
        const res = await fetch("/save-song", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ title, filePath }),
        });

        const result = await res.json();
        if (result.success) {
          alert("✅ Song saved successfully!");
        } else {
          alert("❌ Failed to save song.");
        }
      } catch (err) {
        console.error("Save failed:", err);
        alert("❌ Error saving the song.");
      }
    } else {
      alert("⚠️ Not logged in.");
    }
  });

  // Reset button
  document.getElementById("resetBtn")?.addEventListener("click", () => {
    quill.setText("");
    document.getElementById("lyricsOutput").textContent = "";
    document.getElementById("lyricsContainer").style.display = "none";
    document.getElementById("finalPlayer").pause();
    document.getElementById("finalPlayer").style.display = "none";
    document.getElementById("downloadLink").style.display = "none";
    document.getElementById("postGenButtons").style.display = "none";

    document.querySelectorAll("details").forEach((el) => el.removeAttribute("open"));
    document.querySelector("details").setAttribute("open", true);

    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("completed"));
  });

  function markComplete(label) {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      const summaryText = dropdown.querySelector("summary")?.textContent.trim();
      if (summaryText === label) {
        dropdown.classList.add("completed");
      }
    });
  }
});
