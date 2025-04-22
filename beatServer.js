// beatServer.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'css' directory
app.use('/css', express.static(path.join(__dirname, 'css')));

// Serve static files from the 'js' directory
app.use('/js', express.static(path.join(__dirname, 'js')));

// Serve static HTML files from the 'html' directory
app.use('/html', express.static(path.join(__dirname, 'html')));

// Route to serve the signup page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'signupPage.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

