document.querySelectorAll(".playlist").forEach((playlist) => {
    playlist.addEventListener("click", () => {
      document.querySelectorAll(".playlist").forEach(p => p.classList.remove("selected"));
      playlist.classList.add("selected");
    });
  });
  