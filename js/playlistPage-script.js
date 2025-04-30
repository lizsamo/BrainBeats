// Placeholder for future JS logic (like playing tracks, editing playlists, etc.)
console.log("Playlist Page Loaded");

document.querySelectorAll('.playlist-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    alert(`Switched to ${btn.textContent}`);
  });
});
