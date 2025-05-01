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
  
    // Mocked fetch to backend
    console.log("Generating quiz with settings:");
    console.log("Playlist ID:", playlistId);
    console.log("Question Types:", selectedTypes);
  
    // Replace this with your real API call
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
        // Redirect or render quiz page
        alert("Quiz generated!");
      })
      .catch(err => {
        console.error("Quiz generation failed", err);
      });
  }
  
  document.querySelectorAll('.playlist').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.playlist').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
  