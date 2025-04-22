function generateQuiz() {
  const selectedTypes = Array.from(
    document.querySelectorAll('#quiz-options input:checked')
  ).map(input => input.value);

  const selectedPlaylist = document.querySelector('.playlist.selected');
  const feedbackDiv = document.getElementById("quizFeedback");

  // Clear any existing feedback
  feedbackDiv.textContent = "";
  feedbackDiv.className = "feedback";

  if (!selectedPlaylist) {
    feedbackDiv.textContent = "❌ Please select a playlist!";
    feedbackDiv.classList.add("error");
    return;
  }

  if (selectedTypes.length === 0) {
    feedbackDiv.textContent = "❌ Please select at least one quiz type!";
    feedbackDiv.classList.add("error");
    return;
  }

  const playlistId = selectedPlaylist.getAttribute("data-id");

  feedbackDiv.textContent = "⏳ Generating your quiz...";
  feedbackDiv.classList.add("loading");

  // Allow multiple repeated generations
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
      feedbackDiv.textContent = "✅ New quiz generated successfully!";
      feedbackDiv.classList.remove("loading");
      feedbackDiv.classList.add("success");
    })
    .catch(err => {
      console.error("Quiz generation failed", err);
      feedbackDiv.textContent = "❌ Quiz generation failed. Please try again.";
      feedbackDiv.classList.remove("loading");
      feedbackDiv.classList.add("error");
    });
}

function updateGenerateButtonState() {
  const selectedPlaylist = document.querySelector('.playlist.selected');
  const selectedTypes = document.querySelectorAll('#quiz-options input:checked');
  const generateButton = document.getElementById("generateBtn");

  generateButton.disabled = !(selectedPlaylist && selectedTypes.length > 0);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.playlist').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.playlist').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      updateGenerateButtonState();
    });
  });

  document.querySelectorAll('#quiz-options input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', updateGenerateButtonState);
  });

  const generateButton = document.getElementById("generateBtn");
  if (generateButton) {
    generateButton.addEventListener("click", generateQuiz);
  }

  updateGenerateButtonState();
});

