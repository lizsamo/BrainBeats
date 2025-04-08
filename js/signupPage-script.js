document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    let isValid = true;
    
    // Reset previous error states
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });

    //
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email-error').style.display = 'block';
        document.getElementById('email').classList.add('shake');
        setTimeout(() => {
            document.getElementById('email').classList.remove('shake');
        }, 500);
        isValid = false;
    }
    
    // Validate username
    if (username.length < 3 || username.length > 20) {
        document.getElementById('username-error').style.display = 'block';
        document.getElementById('username').classList.add('shake');
        setTimeout(() => {
            document.getElementById('username').classList.remove('shake');
        }, 500);
        isValid = false;
    }
    
    // Validate password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById('password-error').style.display = 'block';
        document.getElementById('password').classList.add('shake');
        setTimeout(() => {
            document.getElementById('password').classList.remove('shake');
        }, 500);
        isValid = false;
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
        document.getElementById('confirm-password-error').style.display = 'block';
        document.getElementById('confirm-password').classList.add('shake');
        setTimeout(() => {
            document.getElementById('confirm-password').classList.remove('shake');
        }, 500);
        isValid = false;
    }
    
    // Validate terms
    if (!termsAccepted) {
        // If terms are not accepted, add shake animation to the checkbox
        document.getElementById('terms').classList.add('shake');
        setTimeout(() => {
            document.getElementById('terms').classList.remove('shake');
        }, 500);
        isValid = false;
    }
    
    if (isValid) {
        // In a real app, this would connect to your registration API
        console.log('Sign up attempt:', { email, username, password });
        alert('Account created successfully! (This is just a demo)');
        // Redirect to login page after successful signup
        window.location.href = 'index.html';
    }

    // add script for button to redirect to index.html after fulfilling all of the conditions
});