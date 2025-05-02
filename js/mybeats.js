// mybeats.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) return alert("Please log in to view your beats.");

  await loadFoldersAndSongs();
  setupNewFolderHandlers();
});

// 🔁 Load folders and songs from backend
async function loadFoldersAndSongs() {
  const token = localStorage.getItem("jwtToken");

  try {
    const songsRes = await fetch("/my-songs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const songsData = await songsRes.json();

    if (songsData.success && Array.isArray(songsData.folders)) {
      const folders = songsData.folders.map(f => ({
        name: f.name,
        songs: f.songs.map(song => ({
          title: song.title,
          file_path: song.file_path,
          created_at: song.created_at,
        }))
      }));

      saveFolders(folders);
      renderFolders(folders);
      loadRecentlyCreatedSongs();
    } else {
      console.error("❌ Failed to load folders/songs:", songsData.error);
    }
  } catch (err) {
    console.error("❌ Error fetching /my-songs:", err);
  }
}

function saveFolders(folders) {
  window._myFolders = folders;
}

function renderFolders(folders) {
  const container = document.getElementById("folders-container");
  container.innerHTML = "";

  folders.forEach(folder => {
    const folderDiv = document.createElement("div");
    folderDiv.className = "folder clickable";
    folderDiv.textContent = folder.name;

    folderDiv.addEventListener("click", () => {
      openFolderModal(folder);
    });

    container.appendChild(folderDiv);
  });
}

function openFolderModal(folder) {
  const modal = document.getElementById("folder-songs-modal");
  const backdrop = document.getElementById("modal-backdrop");
  const songsList = document.getElementById("folder-songs-list");

  songsList.innerHTML = "";

  if (folder.songs.length === 0) {
    songsList.innerHTML = "<p>No songs in this folder.</p>";
  } else {
    folder.songs.forEach(song => {
      const audioContainer = document.createElement("div");
      audioContainer.className = "playlist";

      const title = document.createElement("div");
      title.textContent = song.title;

      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = song.file_path;
      audio.style.marginTop = "10px";
      audio.style.width = "100%";

      audioContainer.appendChild(title);
      audioContainer.appendChild(audio);
      songsList.appendChild(audioContainer);
    });
  }

  document.querySelector("#folder-songs-modal h3").textContent = `Songs in ${folder.name} Folder`;
  modal.classList.remove("hidden");
  backdrop.classList.remove("hidden");
}

function closeFolderModal() {
  document.getElementById("folder-songs-modal").classList.add("hidden");
  document.getElementById("modal-backdrop").classList.add("hidden");
}

// 🔄 Load most recent 4 songs
async function loadRecentlyCreatedSongs() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    console.error("❌ No JWT found in localStorage.");
    return;
  }

  try {
    const res = await fetch("/recent-songs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("❌ Failed to fetch recent songs:", error.message);
      return;
    }

    const songs = await res.json();
    const container = document.getElementById("recently-created");
    container.innerHTML = "";

    const sortedSongs = songs
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);

    sortedSongs.forEach(song => {
      const card = document.createElement("div");
      card.className = "playlist";
      card.innerHTML = `
        <div class="song-info">
          <h3 class="song-title">${song.title}</h3>
          <audio controls preload="metadata" src="${song.file_path}" class="audio-player"></audio>
        </div>
      `;
      container.appendChild(card);
    });

    applyPlaylistSelection();
  } catch (err) {
    console.error("❌ Error loading recent songs:", err.message);
  }
}

function applyPlaylistSelection() {
  document.querySelectorAll(".playlist").forEach((playlist) => {
    playlist.addEventListener("click", () => {
      document.querySelectorAll(".playlist").forEach(p => p.classList.remove("selected"));
      playlist.classList.add("selected");
    });
  });
}

// 🟢 Folder creation logic
function setupNewFolderHandlers() {
  const modal = document.getElementById("new-folder-modal");
  const nameInput = document.getElementById("new-folder-name");

  document.getElementById("new-folder-btn").addEventListener("click", () => {
    modal.classList.remove("hidden");
    nameInput.value = "";
    nameInput.focus();
  });

  document.getElementById("create-folder-cancel").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  document.getElementById("create-folder-confirm").addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a folder name.");

    const token = localStorage.getItem("jwtToken");

    try {
      const res = await fetch("/create-folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      if (!data.success) return alert(data.error);

      alert(`✅ Folder "${data.folder.name}" created!`);
      modal.classList.add("hidden");

      // Reload the folder list
      await loadFoldersAndSongs();
    } catch (err) {
      console.error("❌ Error creating folder:", err.message);
      alert("Error creating folder.");
    }
  });
}
