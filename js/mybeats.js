// mybeats.js

document.addEventListener("DOMContentLoaded", async () => { 
  const token = localStorage.getItem("jwtToken");
  if (!token) return alert("Please log in to view your beats.");

  await loadAllFolders();
  await loadFoldersAndSongs();
  setupNewFolderHandlers();
});

async function loadAllFolders() {
  const token = localStorage.getItem("jwtToken");
  try {
    const res = await fetch("/my-folders", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      window._allFolders = data.folders.map(f => ({
        id: f.folder_id,
        name: f.folder_name
      }));
    } else {
      console.error("❌ Failed to fetch all folders:", data.error);
      window._allFolders = [];
    }
  } catch (err) {
    console.error("❌ Error fetching /my-folders:", err);
    window._allFolders = [];
  }
}

async function loadFoldersAndSongs() {
  const token = localStorage.getItem("jwtToken");

  try {
    const songsRes = await fetch("/my-songs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const songsData = await songsRes.json();

    if (songsData.success && Array.isArray(songsData.folders)) {
      const folders = songsData.folders.map(f => ({
        id: f.id,
        name: f.name,
        songs: f.songs.map(song => ({
          id: song.id,
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
  }

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

    const moveSelect = document.createElement("select");
    moveSelect.innerHTML = `<option value="">Move to...</option>` +
      window._allFolders
        .filter(f => f.id !== folder.id)
        .map(f => `<option value="${f.id}">${f.name}</option>`)
        .join("");

    moveSelect.addEventListener("change", async (e) => {
      const targetFolderId = e.target.value;
      if (!targetFolderId) return;

      const token = localStorage.getItem("jwtToken");
      try {
        const res = await fetch("/move-song", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ song_id: song.id, target_folder_id: targetFolderId }),
        });

        const result = await res.json();
        if (!result.success) return alert(result.error || "Failed to move song.");

        alert("✅ Song moved successfully.");
        await loadAllFolders();
        await loadFoldersAndSongs();
      } catch (err) {
        console.error("❌ Error moving song:", err);
      }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ Delete";
    deleteBtn.className = "delete-button";
    deleteBtn.style.marginTop = "10px";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Are you sure you want to delete "${song.title}"?`)) return;

      const token = localStorage.getItem("jwtToken");
      try {
        const res = await fetch(`/delete-song/${song.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await res.json();
        if (!result.success) return alert(result.error || "Failed to delete song.");

        alert("🗑️ Song deleted successfully.");
        audioContainer.remove(); // ✅ remove from modal

        // ✅ Also remove from Recently Created section
        const recentCards = document.querySelectorAll("#recently-created .playlist");
        recentCards.forEach(card => {
          const audio = card.querySelector("audio");
          if (audio && audio.src.includes(song.file_path)) {
            card.remove();
          }
        });
      } catch (err) {
        console.error("❌ Error deleting song:", err);
      }
    });

    audioContainer.appendChild(title);
    audioContainer.appendChild(audio);
    audioContainer.appendChild(moveSelect);
    audioContainer.appendChild(deleteBtn);
    songsList.appendChild(audioContainer);
  });

  if (folder.songs.length === 0) {
    const moveSelectNote = document.createElement("p");
    moveSelectNote.textContent = "No songs in this folder, but you can move songs to:";
    songsList.appendChild(moveSelectNote);

    const folderList = document.createElement("ul");
    window._allFolders
      .filter(f => f.id !== folder.id)
      .forEach(f => {
        const li = document.createElement("li");
        li.textContent = f.name;
        folderList.appendChild(li);
      });

    songsList.appendChild(folderList);
  }

  document.querySelector("#folder-songs-modal h3").textContent = `Songs in ${folder.name} Folder`;
  modal.classList.remove("hidden");
  backdrop.classList.remove("hidden");
}

function closeFolderModal() {
  document.getElementById("folder-songs-modal").classList.add("hidden");
  document.getElementById("modal-backdrop").classList.add("hidden");
}

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

      await loadAllFolders();
      await loadFoldersAndSongs();
    } catch (err) {
      console.error("❌ Error creating folder:", err.message);
      alert("Error creating folder.");
    }
  });
}
