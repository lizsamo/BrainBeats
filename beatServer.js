// beatServer.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files (CSS, JS, and HTML) from the 'css', 'js', and 'html' directories
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));


// Route to serve the signup page
app.get('/loginPage.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'loginPage.html'));
});


// Serve homeDashboard at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'homeDashboard.html'));
});

// Serve homeDashboard at /homeDashboard.html
app.get('/homeDashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'homeDashboard.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

