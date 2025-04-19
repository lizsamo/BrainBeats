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
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Server returned extracted text:", data.text);

        document.querySelectorAll("details").forEach((el) => {
          const label = el.querySelector("summary")?.textContent.trim();
          if (label === "📝 Highlight Text for Lyrics") el.setAttribute("open", true);
        });

        if (data.text && data.text.trim().length > 0) {
          console.log("✅ Setting text in Quill...");
          quill.setContents([{ insert: data.text + "\n" }]);
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
    }
  }
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  const selection = quill.getSelection();
  if (!selection || selection.length === 0) {
    alert("Please highlight text to generate lyrics.");
    return;
  }

  const prompt = quill.getText(selection.index, selection.length);
  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    alert("🎤 Generated Lyrics:\n\n" + data.lyrics);
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

