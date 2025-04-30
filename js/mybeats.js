const foldersContainer = document.getElementById("folders-container");
const createFolderBtn = document.getElementById("create-folder");

let folders = JSON.parse(localStorage.getItem("beatFolders")) || [];

function saveFolders() {
  localStorage.setItem("beatFolders", JSON.stringify(folders));
}

function showModal({ message, input = false, onConfirm }) {
  const modal = document.getElementById("modal");
  const messageEl = document.getElementById("modal-message");
  const inputEl = document.getElementById("modal-input");
  const okBtn = document.getElementById("modal-ok");
  const cancelBtn = document.getElementById("modal-cancel");

  messageEl.textContent = message;
  inputEl.classList.toggle("hidden", !input);
  inputEl.value = "";

  modal.classList.remove("hidden");

  okBtn.onclick = () => {
    modal.classList.add("hidden");
    onConfirm(input ? inputEl.value : true);
  };
  cancelBtn.onclick = () => modal.classList.add("hidden");
}

function renderFolders() {
  foldersContainer.innerHTML = "";

  folders.forEach((folder, index) => {
    const folderEl = document.createElement("div");
    folderEl.className = "folder";

    const nameSpan = document.createElement("div");
    nameSpan.className = "folder-name";
    nameSpan.textContent = folder.name || "(No Name)";
    nameSpan.title = folder.name || "(No Name)";

    folderEl.onclick = () => {
      alert(`Open folder: ${folder.name || "Untitled"}`);
    };

    const renameBtn = document.createElement("button");
    renameBtn.innerHTML = "✏️";
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      showModal({
        message: `Rename "${folder.name || "Untitled"}"`,
        input: true,
        onConfirm: (newName) => {
          if (newName) {
            folders[index].name = newName;
            saveFolders();
            renderFolders();
          }
        },
      });
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      showModal({
        message: `Delete folder "${folder.name || "Untitled"}"?`,
        onConfirm: () => {
          folders.splice(index, 1);
          saveFolders();
          renderFolders();
        },
      });
    };

    folderEl.appendChild(nameSpan);
    folderEl.appendChild(renameBtn);
    folderEl.appendChild(deleteBtn);
    foldersContainer.appendChild(folderEl);
  });
}

createFolderBtn.onclick = () => {
  showModal({
    message: "Enter folder name:",
    input: true,
    onConfirm: (name) => {
      folders.push({ name: name || "(No Name)", songs: [] });
      saveFolders();
      renderFolders();
    },
  });
};

renderFolders();

document.addEventListener("DOMContentLoaded", async () => {
  renderFolders();

  const token = localStorage.getItem("jwtToken");
  if (!token) return alert("Please log in to view your beats.");

  try {
    const response = await fetch("/my-songs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      const container = document.getElementById("recently-created");
      container.innerHTML = "";

      data.songs.forEach((song) => {
        const testAudio = new Audio(song.file_path);

        testAudio.addEventListener("loadedmetadata", () => {
          if (testAudio.duration === 0 || isNaN(testAudio.duration)) {
            console.warn("⛔ Skipping broken song:", song.title);
            return;
          }

          const box = document.createElement("div");
          box.className = "playlist";

          const title = document.createElement("div");
          title.textContent = song.title;

          const audio = document.createElement("audio");
          audio.controls = true;
          audio.src = song.file_path;
          audio.style.marginTop = "10px";
          audio.style.width = "100%";

          box.appendChild(title);
          box.appendChild(audio);
          container.appendChild(box);
        });

        testAudio.load(); // trigger metadata load
      });
    } else {
      console.error("Failed to load songs:", data.error);
    }
  } catch (err) {
    console.error("Error fetching songs:", err);
  }

  const container = document.getElementById("most-played");
  if (container) {
    for (let i = 1; i <= 4; i++) {
      const playlist = document.createElement("div");
      playlist.className = "playlist";
      playlist.textContent = `Playlist ${i}`;
      container.appendChild(playlist);
    }

    document.querySelectorAll(".playlist").forEach((el) => {
      el.addEventListener("click", () => {
        document.querySelectorAll(".playlist").forEach(p => p.classList.remove("selected"));
        el.classList.add("selected");
      });
    });
  }
});
