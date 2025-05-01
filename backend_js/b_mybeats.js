const express = require("express");
const { pool } = require("../db");
const authenticateToken = require("./authMiddleware");

const router = express.Router();

// ✅ Return all songs for the user, grouped by folder (including "Beats" folder with songs)
router.get("/my-songs", authenticateToken, async (req, res) => {
  console.log("✅ /my-songs route hit");

  const userId = req.user?.userId;
  if (!userId) {
    console.log("❌ User not authenticated");
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  try {
    res.setHeader("Cache-Control", "no-store");

    // Fetch songs from default "Beats" folder (folder_id IS NULL)
    const beatSongsResult = await pool.query(
      `SELECT song_id, title, file_path, created_at
       FROM generated_songs
       WHERE user_id = $1 AND folder_id IS NULL
       ORDER BY created_at DESC`,
      [userId]
    );
    console.log("✅ Beat songs result:", beatSongsResult.rows);

    // Fetch user-created folders, excluding any folder literally named "Beats"
    const foldersResult = await pool.query(
      `SELECT folder_id, folder_name
       FROM folders
       WHERE user_id = $1 AND folder_name != 'Beats'
       ORDER BY folder_name`,
      [userId]
    );
    console.log("✅ Folders result:", foldersResult.rows);

    const folders = [];

    // Add "Beats" folder with unassigned songs
    folders.push({
      name: "Beats",
      songs: beatSongsResult.rows.map(song => ({
        song_id: song.song_id,
        title: song.title,
        file_path: song.file_path,
        created_at: song.created_at,
      })),
    });

    // Add custom folders with their songs
    for (const folder of foldersResult.rows) {
      const songsResult = await pool.query(
        `SELECT song_id, title, file_path, created_at
         FROM generated_songs
         WHERE user_id = $1 AND folder_id = $2
         ORDER BY created_at DESC`,
        [userId, folder.folder_id]
      );
      console.log(`✅ Songs for folder "${folder.folder_name}":`, songsResult.rows);

      folders.push({
        name: folder.folder_name,
        songs: songsResult.rows.map(song => ({
          song_id: song.song_id,
          title: song.title,
          file_path: song.file_path,
          created_at: song.created_at,
        })),
      });
    }

    res.json({ success: true, folders });
  } catch (err) {
    console.error("❌ Failed to fetch songs and folders:", err.message);
    res.status(500).json({ success: false, error: "Failed to load songs and folders" });
  }
});

// ✅ Endpoint to return the 4 most recent songs
router.get("/recent-songs", authenticateToken, async (req, res) => {
  console.log("✅ /recent-songs route hit");

  const userId = req.user?.userId;
  if (!userId) {
    console.log("❌ User not authenticated");
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  try {
    const recentSongsResult = await pool.query(
      `SELECT song_id, title, file_path, created_at
       FROM generated_songs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 4`,
      [userId]
    );
    console.log("✅ Recent songs result:", recentSongsResult.rows);

    res.json(recentSongsResult.rows);
  } catch (err) {
    console.error("❌ Failed to fetch recent songs:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch recent songs" });
  }
});

// ✅ Create a new folder
router.post("/create-folder", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  const { name } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ success: false, error: "Folder name is required" });
  }

  const folderName = name.trim();

  // Prevent creating a folder named "Beats"
  if (folderName.toLowerCase() === "beats") {
    return res.status(400).json({
      success: false,
      error: "The folder name 'Beats' is reserved and cannot be used",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO folders (user_id, folder_name)
       VALUES ($1, $2)
       RETURNING folder_id, folder_name`,
      [userId, folderName]
    );

    res.json({
      success: true,
      folder: {
        folder_id: result.rows[0].folder_id,
        name: result.rows[0].folder_name,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "You already have a folder with this name",
      });
    }

    console.error("❌ Failed to create folder:", err.message);
    res.status(500).json({ success: false, error: "Failed to create folder" });
  }
});

module.exports = router;
