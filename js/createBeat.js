let quill;
window.addEventListener("DOMContentLoaded", () => {
  quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Upload a file to see extracted content here...",
  });
});

document.getElementById("saveBtn").addEventListener("click", () => {
  alert("Your beat has been saved!");
  markComplete("💾 Save Music");
});

document.getElementById("fileUpload").addEventListener("change", async (event) => {
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

      document.getElementById("loadingOverlay").style.display = "none";

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Server returned extracted text:", data.text);

        if (data.text && data.text.trim().length > 0) {
          const formatted = data.text
            .split(/[\n\r]+|[.,]+/)
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join("\n");

          quill.setText(formatted + "\n");

          // ✅ Open the highlight dropdown only after successful upload
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
      document.getElementById("loadingOverlay").style.display = "none";
      console.error("❌ Upload error:", err);
    }
  }
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  const selection = quill.getSelection();
  if (!selection || selection.length === 0) {
    alert("Please highlight text to generate lyrics.");
    return;
  }

  document.getElementById("lyricsContainer").style.display = "none"; // hide box before regenerate

  const prompt = quill.getText(selection.index, selection.length);
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
