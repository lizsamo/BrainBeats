// beatServer.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/html", express.static(path.join(__dirname, "html")));
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const signupRoute = require("./backend_js/b_signupPage-script");
const loginRoute = require("./backend_js/b_loginPage-script");

// Use routes
app.use("/api", signupRoute);
app.use("/api", loginRoute);

// Serve HTML pages directly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "signupPage.html"));
});

app.get("/loginPage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "loginPage.html"));
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
