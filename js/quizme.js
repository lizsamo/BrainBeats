// Main function to handle quiz generation
function generateQuiz() {
  const selectedTypes = Array.from(
    document.querySelectorAll('#quiz-options input:checked')
  ).map(input => input.value);

  const selectedPlaylist = document.querySelector('.playlist.selected');

  if (!selectedPlaylist) {
    alert("Please select a playlist!");
    return;
  }

  const playlistId = selectedPlaylist.getAttribute("data-id");

  // Log or send data to your API
  console.log("Generating quiz with settings:");
  console.log("Playlist ID:", playlistId);
  console.log("Question Types:", selectedTypes);

  // Example API call
  fetch('/api/generate-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      playlistId: playlistId,
      questionTypes: selectedTypes
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Quiz Data:", data);
      alert("Quiz generated!");
      // Optionally: window.location.href = "/quiz-page";
    })
    .catch(err => {
      console.error("Quiz generation failed", err);
    });
}

// Wait for DOM content to be loaded
document.addEventListener("DOMContentLoaded", () => {
  // Handle playlist selection
  document.querySelectorAll('.playlist').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.playlist').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    });
  });

  // Hook up the generate quiz button
  const generateButton = document.getElementById("generateBtn");
  if (generateButton) {
    generateButton.addEventListener("click", generateQuiz);
  }
});
