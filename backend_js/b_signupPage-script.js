// b_signupPage-script.js

const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if email or username already exists
    const userCheck = await pool.query(
      "SELECT user_id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email or username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user with current timestamp
    const insertUser = await pool.query(
      `INSERT INTO users (username, password_hash, email, created_at, last_login)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING user_id`,
      [username, hashedPassword, email]
    );

    res.status(201).json({
      message: "User created successfully",
      userId: insertUser.rows[0].user_id,
    });

  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
