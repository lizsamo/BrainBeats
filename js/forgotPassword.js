// Mock user database
const users = [
    { email: 'user@example.com', password: 'password123' },
    { email: 'test@example.com', password: 'test123' }
];

// Function to generate a random token
function generateToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

document.getElementById('forgot-password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const statusMessage = document.getElementById('status-message');
    const submitBtn = document.getElementById('submit-btn');
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        // Show error for invalid email
        statusMessage.className = 'status-message error';
        statusMessage.textContent = 'Please enter a valid email address.';
        statusMessage.style.display = 'block';
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
        return;
    }
    
    // Simulate server processing time
    setTimeout(function() {
        // Check if email exists in our mock database
        const user = users.find(u => u.email === email);
        
        if (user) {
            // Generate and store reset token with expiry (1 hour from now)
            const token = generateToken();
            const tokenData = {
                email: email,
                expires: Date.now() + 3600000 // 1 hour
            };
            
            // Store token in localStorage (in a real app, this would be server-side)
            localStorage.setItem('resetToken_' + token, JSON.stringify(tokenData));
            
            // In a real app, this would send an email
            // For demo purposes, we'll just create and open the reset page with token
            console.log('Reset link would be sent to email: reset-password.html?token=' + token);
            
            // Create a simulated "email" link the user can click
            const resetLink = document.createElement('a');
            resetLink.href = 'reset-password.html?token=' + token;
            resetLink.textContent = 'Click here to reset your password (simulating email link)';
            resetLink.style.display = 'block';
            resetLink.style.marginTop = '10px';
            resetLink.style.textAlign = 'center';
            resetLink.target = '_blank';
            
            // Add link after status message
            statusMessage.after(resetLink);
        }
        
        // Always show success message (for security - don't reveal if email exists)
        statusMessage.className = 'status-message success';
        statusMessage.textContent = 'If an account exists with this email, password reset instructions have been sent.';
        statusMessage.style.display = 'block';
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Reset Password';
    }, 1500);
});