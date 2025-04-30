// // b_loginPage-script.js

// const express = require("express");
// const bcrypt = require("bcrypt");
// const { pool } = require("../db");

// const router = express.Router();

// // Login route
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   // Check if email and password are provided
//   if (!email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Email and password are required"
//     });
//   }

//   try {
//     // Query the database to find the user with the provided email
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     const user = result.rows[0];

//     // Check if user exists
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password"
//       });
//     }

//     // Log the user password for debugging purposes (ensure you remove this in production)
//     console.log('User password:', user.password_hash);

//     // Compare the provided password with the stored hashed password
//     const match = await bcrypt.compare(password, user.password_hash);

//     // If the passwords match
//     if (match) {
//       return res.status(200).json({
//         success: true,
//         message: "Login successful"
//       });
//     } else {
//       // If the passwords do not match
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password"
//       });
//     }
//   } catch (err) {
//     // Handle any errors during the query
//     console.error('Error:', err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// });

// module.exports = router;

// b_loginPage-script.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Login route
router.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    // Query the database to find the user with the provided email or username
    // This allows login using either email or username
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $1", 
      [email]
    );
    
    const user = result.rows[0];

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password"
      });
    }

    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, user.password_hash);

    // If the passwords match
    if (match) {
      // Create JWT payload with user information
      const payload = {
        user: {
          id: user.user_id,
          email: user.email,
          username: user.username
        }
      };

      // Generate JWT token
      const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
      );

      // Update last login time
      await pool.query(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1",
        [user.user_id]
      );

      // Log login for analytics (if user_sessions table exists)
      try {
        await pool.query(
          "INSERT INTO user_sessions (user_id, login_time, is_active) VALUES ($1, CURRENT_TIMESTAMP, true)",
          [user.user_id]
        );
      } catch (sessionErr) {
        // If user_sessions table doesn't exist or has different schema, just log and continue
        console.log("Note: Unable to record session, but login successful:", sessionErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        userId: user.user_id,
        username: user.username
      });
    } else {
      // If the passwords do not match
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password"
      });
    }
  } catch (err) {
    // Handle any errors during the query
    console.error('Error during login:', err);
    return res.status(500).json({
      success: false,
      message: "Server error during login process"
    });
  }
});

module.exports = router;