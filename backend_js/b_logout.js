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
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     const user = result.rows[0];

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password"
//       });
//     }

//     // Compare the provided password with the stored hashed password
//     const match = await bcrypt.compare(password, user.password_hash);

//     // If the passwords match
//     if (match) {
//       // Store user ID in session
//       req.session.userId = user.user_id;

//       await pool.query(
//         "INSERT INTO user_sessions (user_id, login_time, is_active) VALUES ($1, CURRENT_TIMESTAMP, true)",
//         [user.user_id]
//       );
      
//       await pool.query(
//         "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1",
//         [user.user_id]
//       );

//       return res.status(200).json({
//         success: true,
//         message: "Login successful",
//         userId: user.user_id
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

// b_logout.js

const express = require("express");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

// Logout route (requires authentication)
router.post("/logout", auth, async (req, res) => {
  try {
    // Get user ID from authentication middleware
    const userId = req.user.id;
    
    // Update user session in database (optional)
    await pool.query(
      "UPDATE user_sessions SET logout_time = CURRENT_TIMESTAMP, is_active = false WHERE user_id = $1 AND is_active = true",
      [userId]
    );

    // Note: With JWT, you can't invalidate tokens server-side
    // The client needs to remove the token from storage
    // We're returning success to trigger client-side token removal

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (err) {
    console.error('Error during logout:', err);
    return res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
});

module.exports = router;