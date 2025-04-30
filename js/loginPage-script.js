// document.getElementById('login-form').addEventListener('submit', function(e) {
//     e.preventDefault();
    
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     let isValid = true;
    
//     // Reset previous error states
//     document.getElementById('email-error').style.display = 'none';
//     document.getElementById('password-error').style.display = 'none';
    
//     // Validate email/username
//     if (!email) {
//         document.getElementById('email-error').style.display = 'block';
//         document.getElementById('email').classList.add('shake');
//         setTimeout(() => {
//             document.getElementById('email').classList.remove('shake');
//         }, 500);
//         isValid = false;
//     }
    
//     // Validate password
//     if (!password || password.length < 6) {
//         document.getElementById('password-error').style.display = 'block';
//         document.getElementById('password').classList.add('shake');
//         setTimeout(() => {
//             document.getElementById('password').classList.remove('shake');
//         }, 500);
//         isValid = false;
//     }
    
//     if (isValid) {
//         // Send login request to the backend
//         const loginData = { email, password };
        
//         fetch('/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(loginData),
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 alert('Login successful!');
//                 window.location.href = '/homeDashboard.html';  // Adjust path as needed
//             } else {
//                 // Handle specific error messages from the server
//                 alert(data.message || 'Invalid email or password.');
//             }
//         })
//         .catch(error => {
//             console.error('Error logging in:', error);
//             alert('An error occurred, please try again.');
//         });
//     }
// });

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
        // Show loading indicator or disable login button
        const loginButton = document.querySelector('button[type="submit"]');
        const originalButtonText = loginButton.textContent;
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
        
        // Send login request to the backend
        const loginData = { email, password };
        
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        })
        .then(response => {
            // Store the status before parsing JSON
            const status = response.status;
            return response.json().then(data => {
                return { status, data };
            });
        })
        .then(({ status, data }) => {
            if (data.success) {
                // Store JWT token in localStorage
                localStorage.setItem('brainbeats_token', data.token);
                
                // Store user info
                localStorage.setItem('brainbeats_user', JSON.stringify({
                    userId: data.userId,
                    username: data.username || email,
                    loggedIn: true
                }));
                
                // Redirect to dashboard
                window.location.href = '../html/homeDashboard.html';
            } else {
                // Display error message
                const errorMessage = data.message || 'Login failed. Please check your credentials.';
                document.getElementById('password-error').textContent = errorMessage;
                document.getElementById('password-error').style.display = 'block';
                
                // Reset login button
                loginButton.disabled = false;
                loginButton.textContent = originalButtonText;
            }
        })
        .catch(error => {
            console.error('Error logging in:', error);
            document.getElementById('password-error').textContent = 'Network error. Please try again.';
            document.getElementById('password-error').style.display = 'block';
            
            // Reset login button
            loginButton.disabled = false;
            loginButton.textContent = originalButtonText;
        });
    }
});