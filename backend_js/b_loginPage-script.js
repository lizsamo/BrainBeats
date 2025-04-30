// backend_js/b_loginPage-script.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const router = express.Router();
require('dotenv').config();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Incorrect password." });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log(`✅ JWT created for user: ${email}`);
    return res.json({ success: true, token });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
