document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let isValid = true;
  
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';
  
    if (!email) {
      document.getElementById('email-error').style.display = 'block';
      document.getElementById('email').classList.add('shake');
      setTimeout(() => {
        document.getElementById('email').classList.remove('shake');
      }, 500);
      isValid = false;
    }
  
    if (!password || password.length < 6) {
      document.getElementById('password-error').style.display = 'block';
      document.getElementById('password').classList.add('shake');
      setTimeout(() => {
        document.getElementById('password').classList.remove('shake');
      }, 500);
      isValid = false;
    }
  
    if (isValid) {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert("✅ Login successful!");
          window.location.href = "/homeDashboard.html"; // update this if needed
        } else {
          alert(data.error || "Login failed");
        }
      } catch (err) {
        console.error("❌ Login request failed:", err);
        alert("Something went wrong.");
      }
    }
  });
  