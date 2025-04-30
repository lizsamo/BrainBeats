// frontend/js/loginPage-script.js
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let isValid = true;
  
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';
  
    if (!email) {
      document.getElementById('email-error').style.display = 'block';
      document.getElementById('email').classList.add('shake');
      setTimeout(() => { document.getElementById('email').classList.remove('shake'); }, 500);
      isValid = false;
    }
  
    if (!password || password.length < 6) {
      document.getElementById('password-error').style.display = 'block';
      document.getElementById('password').classList.add('shake');
      setTimeout(() => { document.getElementById('password').classList.remove('shake'); }, 500);
      isValid = false;
    }
  
    if (isValid) {
      fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.token) {
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('userEmail', email);  // ✅ Store email for convenience
            window.location.href = '/homeDashboard.html';
          }
           else {
          alert(data.message || 'Invalid email or password.');
        }
      })
      .catch(error => {
        console.error('Error logging in:', error);
        alert('An error occurred, please try again.');
      });
    }
  });
  