// b_signupPage-script.js

const express = require("express");
const bcrypt = require("bcrypt");
const { pool } = require("../db");
const router = express.Router();

router.post("/signup", async (req, res) => {
  console.log("📥 /signup route hit");

  const { email, username, password } = req.body;
  console.log("📨 Received data:", { email, username, password: password ? "•••" : null });

  if (!email || !username || !password) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("🔍 Checking for existing user...");
    const userCheck = await pool.query(
      "SELECT user_id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      console.warn("❗ Email or username already exists");
      return res.status(409).json({ error: "Email or username already exists" });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("📝 Inserting new user into the database...");
    const insertUser = await pool.query(
      `INSERT INTO users (username, password_hash, email, created_at, last_login)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING user_id`,
      [username, hashedPassword, email]
    );

    const newUserId = insertUser.rows[0]?.user_id;
    console.log("✅ User inserted successfully with ID:", newUserId);

    res.status(201).json({
      message: "User created successfully",
      userId: newUserId,
    });

  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
