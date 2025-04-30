// backend_js/b_mybeats.js
const express = require("express");
const { pool } = require("../db");
const authenticateToken = require("./authMiddleware");

const router = express.Router();

// ✅ Fetch current user's saved songs
router.get("/my-songs", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT song_id, title, file_path, created_at
       FROM generated_songs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );
    res.json({ success: true, songs: result.rows });
  } catch (err) {
    console.error("❌ Failed to fetch songs:", err.message);
    res.status(500).json({ success: false, error: "Failed to load songs" });
  }
});

module.exports = router;
