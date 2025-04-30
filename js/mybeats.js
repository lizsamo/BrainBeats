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

// Enhancement: Interactive Playlist Tiles
function enablePlaylistInteractivity() {
  const sections = ["most-played", "recently-created"];
  sections.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      for (let i = 1; i <= 4; i++) {
        const playlist = document.createElement("div");
        playlist.className = "playlist";
        playlist.innerHTML = `Playlist ${i} <span class="play-icon">▶️</span>`;
        container.appendChild(playlist);
      }
    }
  });

  document.querySelectorAll(".playlist").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".playlist").forEach(p => p.classList.remove("selected"));
      el.classList.add("selected");
    });
  });
}

document.addEventListener("DOMContentLoaded", enablePlaylistInteractivity);