// document.addEventListener('DOMContentLoaded', function() {
//     const logoutButton = document.querySelector('.logout-btn');
//     if (logoutButton) {
//       logoutButton.addEventListener('click', handleLogout);
//     }
    
//     // Function to handle logout process
//     async function handleLogout() {
//       try {
//         logoutButton.disabled = true;
//         logoutButton.textContent = 'Logging out...';
        
//         // Send request to backend API to handle database logout
//         const response = await fetch('/api/auth/logout', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           credentials: 'include' // Include cookies for session-based auth
//         });
        
//         const data = await response.json();
        
//         if (response.ok) {
//           showMessage('Logout successful!', 'success');
//           localStorage.removeItem('brainbeats_user');
//           setTimeout(() => {
//             window.location.href = '../html/homeDashboard.html';
//           }, 1500);
//         } else {
//           // Show error message if logout failed
//           showMessage(`Logout failed: ${data.message}`, 'error');
//           logoutButton.disabled = false;
//           logoutButton.textContent = 'Log Out';
//         }
//       } catch (error) {
//         console.error('Logout error:', error);
//         showMessage('Logout failed. Please try again.', 'error'); //this currently displays --> not able to lgout
//         logoutButton.disabled = false;
//         logoutButton.textContent = 'Log Out';
//       }
//     }
    
//     // Function to display status messages
//     function showMessage(message, type) {
//       const messageElement = document.createElement('div');
//       messageElement.className = `message ${type}`;
//       messageElement.textContent = message;

//       messageElement.style.padding = '12px 20px';
//       messageElement.style.borderRadius = '6px';
//       messageElement.style.marginTop = '20px';
//       messageElement.style.fontWeight = 'bold';
      
//       if (type === 'success') {
//         messageElement.style.backgroundColor = '#d4edda';
//         messageElement.style.color = '#155724';
//         messageElement.style.border = '1px solid #c3e6cb';
//       } else {
//         messageElement.style.backgroundColor = '#f8d7da';
//         messageElement.style.color = '#721c24';
//         messageElement.style.border = '1px solid #f5c6cb';
//       }
      
//       // Find the danger zone section and append the message after the button
//       const dangerZone = document.querySelector('.danger-zone');
//       dangerZone.appendChild(messageElement);
      
//       setTimeout(() => {
//         if (messageElement.parentNode) {
//           messageElement.parentNode.removeChild(messageElement);
//         }
//       }, 5000);
//     }
//   });
  
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const checkLoginStatus = () => {
      const token = localStorage.getItem('brainbeats_token');
      const userData = localStorage.getItem('brainbeats_user');
      
      if (!token || !userData) {
          // If not logged in, redirect to login page
          window.location.href = '../html/loginPage.html';
          return false;
      }
      return true;
  };
  
  // Check login status on page load
  if (!checkLoginStatus()) return;
  
  // Get logout button
  const logoutButton = document.querySelector('.logout-btn');
  if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
  }
  
  // Function to handle logout process
  async function handleLogout() {
      try {
          logoutButton.disabled = true;
          logoutButton.textContent = 'Logging out...';
          
          // Get JWT token from local storage
          const token = localStorage.getItem('brainbeats_token');
          
          if (!token) {
              // If no token found, just clear local storage and redirect
              localStorage.removeItem('brainbeats_token');
              localStorage.removeItem('brainbeats_user');
              window.location.href = '../html/loginPage.html';
              return;
          }
          
          // Send request to backend API
          const response = await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'x-auth-token': token // Send token in header
              }
          });
          
          const data = await response.json();
          
          // Always clear local storage regardless of server response
          localStorage.removeItem('brainbeats_token');
          localStorage.removeItem('brainbeats_user');
          
          if (response.ok) {
              showMessage('Logout successful!', 'success');
              setTimeout(() => {
                  window.location.href = '../html/loginPage.html';
              }, 1500);
          } else {
              // Show warning but still "log out" locally
              showMessage(`Server notification: ${data.message}`, 'warning');
              setTimeout(() => {
                  window.location.href = '../html/loginPage.html';
              }, 1500);
          }
      } catch (error) {
          console.error('Logout error:', error);
          // Still clear local storage on error
          localStorage.removeItem('brainbeats_token');
          localStorage.removeItem('brainbeats_user');
          
          showMessage('Logged out locally. Server error occurred.', 'warning');
          setTimeout(() => {
              window.location.href = '../html/loginPage.html';
          }, 1500);
      }
  }
  
  // Function to display status messages
  function showMessage(message, type) {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${type}`;
      messageElement.textContent = message;

      messageElement.style.padding = '12px 20px';
      messageElement.style.borderRadius = '6px';
      messageElement.style.marginTop = '20px';
      messageElement.style.fontWeight = 'bold';
      
      if (type === 'success') {
          messageElement.style.backgroundColor = '#d4edda';
          messageElement.style.color = '#155724';
          messageElement.style.border = '1px solid #c3e6cb';
      } else if (type === 'warning') {
          messageElement.style.backgroundColor = '#fff3cd';
          messageElement.style.color = '#856404';
          messageElement.style.border = '1px solid #ffeeba';
      } else {
          messageElement.style.backgroundColor = '#f8d7da';
          messageElement.style.color = '#721c24';
          messageElement.style.border = '1px solid #f5c6cb';
      }
      
      // Find the danger zone section and append the message after the button
      const dangerZone = document.querySelector('.danger-zone');
      dangerZone.appendChild(messageElement);
      
      setTimeout(() => {
          if (messageElement.parentNode) {
              messageElement.parentNode.removeChild(messageElement);
          }
      }, 5000);
  }
});