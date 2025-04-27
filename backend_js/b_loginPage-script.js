// b_loginPage-script.js

const express = require("express");
const bcrypt = require("bcrypt");
const { pool } = require("../db");

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    // Query the database to find the user with the provided email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Log the user password for debugging purposes (ensure you remove this in production)
    console.log('User password:', user.password_hash);

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password_hash);

    // If the passwords match
    if (match) {
      return res.status(200).json({
        success: true,
        message: "Login successful"
      });
    } else {
      // If the passwords do not match
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
  } catch (err) {
    // Handle any errors during the query
    console.error('Error:', err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
