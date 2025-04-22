// beatServer.js
// beatServer.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'html' directory
app.use(express.static(path.join(__dirname, 'html')));

// Import routes from backend_js folder
const signupRoute = require("./backend_js/b_signupPage-script");

// Mount routes
app.use("/api", signupRoute);

// Serve the signup page at the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'signupPage.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
