// Handle Friend Activity button
document.getElementById("activityBtn").addEventListener("click", () => {
  alert("Friend activity clicked!");
});

// Handle Playlist Selection
document.querySelectorAll(".playlist").forEach((playlist) => {
  playlist.addEventListener("click", () => {
    document.querySelectorAll(".playlist").forEach(p => p.classList.remove("selected"));
    playlist.classList.add("selected");
  });
});
