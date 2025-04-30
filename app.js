// // app.js (Main server file)

// const express = require("express");
// const session = require("express-session");
// const path = require("path");
// const { pool } = require("./db");

// const loginRoutes = require("./backend_js/b_loginPage-script.js");
// const logoutRoutes = require("./backend_js/b_logout.js");

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(__dirname, "public")));

// app.use(session({
//   secret: process.env.SESSION_SECRET || "your-secret-key", // uses session secret or string if sess secret not available
//   resave: false, // 
//   saveUninitialized: false,
//   cookie: { 
//     secure: process.env.NODE_ENV === "production", 
//     maxAge: 24 * 60 * 60 * 1000 
//   }
// }));

// // Authentication middleware
// app.use((req, res, next) => {
//   if (req.session && req.session.userId) {
//     req.user = { id: req.session.userId };
//   }
//   next();
// });

// // API routes
// app.use("/api/auth", loginRoutes);
// app.use("/api/auth", logoutRoutes);

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// app.js (Main server file)

const express = require("express");
const path = require("path");
const { pool } = require("./db");

const loginRoutes = require("./backend_js/b_loginPage-script.js");
const logoutRoutes = require("./backend_js/b_logout.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/auth", loginRoutes);
app.use("/api/auth", logoutRoutes);

// Protected route example
const auth = require("./middleware/auth");
app.get("/api/user", auth, async (req, res) => {
  try {
    // Get user info from database (excluding password)
    const result = await pool.query(
      "SELECT user_id, email, username, created_at, last_login FROM users WHERE user_id = $1",
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Serve front-end for any other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "loginPage.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
