// beatServer.js

const express = require("express");
const path = require("path");
require("dotenv").config();
const { pool } = require("./db");


const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Static files
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/html", express.static(path.join(__dirname, "html")));

// Main routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "loginPage.html"));
});

app.get("/loginPage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "loginPage.html"));
});

app.get("/homeDashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "homeDashboard.html"));
});

app.get("/createBeat.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "createBeat.html"));
});

app.get("/quizme.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "quizme.html"));
});

app.get("/explorepage.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "explorepage.html"));
});

app.get("/mybeats.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "mybeats.html"));
});

app.get("/settings.html", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "settings.html"));
});

// Modularized backend routes
const createBeatRoutes = require("./backend_js/b_createBeat.js");
app.use("/", createBeatRoutes);

const signupRoutes = require("./backend_js/b_signupPage-script.js");
app.use("/", signupRoutes);

const loginRoutes = require("./backend_js/b_loginPage-script.js");
app.use("/", loginRoutes);

const myBeatsRoutes = require("./backend_js/b_mybeats.js");
app.use("/", myBeatsRoutes);



console.log(`🌐 Database Host: ${process.env.DB_HOST}`);
console.log(`👤 Database User: ${process.env.DB_USER}`);

// Check the database connection when the server starts
pool.connect()
  .then(client => {
    console.log("✅ Database connected successfully!");
    client.release(); // release the client after use
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
  });

// ✅ Health check route for Render
app.get('/healthz', (req, res) => res.send('OK'));

// Start the server after database check
app.listen(port, () => {
  console.log(`🚀 BrainBeats backend running at → http://localhost:${port}`);
});
