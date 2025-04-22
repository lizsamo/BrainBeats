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

  if (selectedTypes.length === 0) {
    alert("Please select at least one quiz type!");
    return;
  }

  const playlistId = selectedPlaylist.getAttribute("data-id");

  console.log("Generating quiz with settings:");
  console.log("Playlist ID:", playlistId);
  console.log("Question Types:", selectedTypes);

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
    })
    .catch(err => {
      console.error("Quiz generation failed", err);
    });
}

// Enable/Disable Generate Button Based on UI State
function updateGenerateButtonState() {
  const selectedPlaylist = document.querySelector('.playlist.selected');
  const selectedTypes = document.querySelectorAll('#quiz-options input:checked');
  const generateButton = document.getElementById("generateBtn");

  if (selectedPlaylist && selectedTypes.length > 0) {
    generateButton.disabled = false;
  } else {
    generateButton.disabled = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Handle playlist selection
  document.querySelectorAll('.playlist').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.playlist').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      updateGenerateButtonState();
    });
  });

  // Handle quiz type checkbox changes
  document.querySelectorAll('#quiz-options input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', updateGenerateButtonState);
  });

  // Hook up the generate quiz button
  const generateButton = document.getElementById("generateBtn");
  if (generateButton) {
    generateButton.addEventListener("click", generateQuiz);
  }

  // Initial state check
  updateGenerateButtonState();
});
