document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let isValid = true;
    
    // Reset previous error states
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';
    
    // Validate email/username
    if (!email) {
        document.getElementById('email-error').style.display = 'block';
        document.getElementById('email').classList.add('shake');
        setTimeout(() => {
            document.getElementById('email').classList.remove('shake');
        }, 500);
        isValid = false;
    }
    
    // Validate password
    if (!password || password.length < 6) {
        document.getElementById('password-error').style.display = 'block';
        document.getElementById('password').classList.add('shake');
        setTimeout(() => {
            document.getElementById('password').classList.remove('shake');
        }, 500);
        isValid = false;
    }
    
    if (isValid) {
        // In a real app, this would connect to your authentication API
        console.log('Login attempt:', { email, password, remember: document.getElementById('remember').checked });
        alert('Login successful! (This is just a demo)');
    }
    
});

function redirectToIndex(event) {
    e.preventDefault();
    window.location.href = '../index.html'; //redirect back to the home pade (index file)
}