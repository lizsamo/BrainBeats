// backend_js/b_loginPage-script.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const userQuery = await pool.query(
      "SELECT user_id, password_hash FROM users WHERE email = $1 OR username = $1",
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userQuery.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login timestamp
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE user_id = $1",
      [user.user_id]
    );

    res.status(200).json({ message: "Login successful", userId: user.user_id });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;