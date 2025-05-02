const express = require("express");
const { pool } = require("../db");
const authenticateToken = require("./authMiddleware");

const router = express.Router();

// ✅ Return folders (from folders table) and their songs (including Beats)
router.get("/my-songs", authenticateToken, async (req, res) => {
  console.log("✅ /my-songs route hit");

  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  try {
    res.setHeader("Cache-Control", "no-store");

    const folders = [];

    // Get songs not in any folder (default "Beats" folder)
    const beatsResult = await pool.query(
      `SELECT song_id, title, file_path, created_at
       FROM generated_songs
       WHERE user_id = $1 AND folder_id IS NULL
       ORDER BY created_at DESC`,
      [userId]
    );

    folders.push({
      id: null,
      name: "Beats",
      songs: beatsResult.rows.map(song => ({
        id: song.song_id,
        title: song.title,
        file_path: song.file_path,
        created_at: song.created_at,
      })),
    });

    // Get user-created folders from the folders table
    const userFoldersResult = await pool.query(
      `SELECT folder_id, folder_name
       FROM folders
       WHERE user_id = $1
       ORDER BY folder_name`,
      [userId]
    );

    for (const folder of userFoldersResult.rows) {
      const folderSongsResult = await pool.query(
        `SELECT song_id, title, file_path, created_at
         FROM generated_songs
         WHERE user_id = $1 AND folder_id = $2
         ORDER BY created_at DESC`,
        [userId, folder.folder_id]
      );

      folders.push({
        id: folder.folder_id,
        name: folder.folder_name,
        songs: folderSongsResult.rows.map(song => ({
          id: song.song_id,
          title: song.title,
          file_path: song.file_path,
          created_at: song.created_at,
        })),
      });
    }

    res.json({ success: true, folders });
  } catch (err) {
    console.error("❌ Failed to fetch folders and songs:", err.message);
    res.status(500).json({ success: false, error: "Failed to load folders and songs" });
  }
});

// ✅ Get 4 most recent songs
router.get("/recent-songs", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
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

    res.json(recentSongsResult.rows);
  } catch (err) {
    console.error("❌ Failed to fetch recent songs:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch recent songs" });
  }
});

// ✅ Create new folder
router.post("/create-folder", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  const { name } = req.body;

  if (!userId) return res.status(401).json({ success: false, error: "User not authenticated" });
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ success: false, error: "Folder name is required" });
  }

  const folderName = name.trim();
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

// ✅ Get all user folders (used for move-to dropdowns)
router.get("/my-folders", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  try {
    const result = await pool.query(
      `SELECT folder_id, folder_name
       FROM folders
       WHERE user_id = $1
       ORDER BY folder_name`,
      [userId]
    );

    res.json({
      success: true,
      folders: result.rows,
    });
  } catch (err) {
    console.error("❌ Failed to fetch folders:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch folders" });
  }
});


// ✅ Move a song to a different folder
router.post("/move-song", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  const { song_id, target_folder_id } = req.body;

  if (!userId || !song_id) {
    return res.status(400).json({ success: false, error: "Missing song ID or authentication" });
  }

  try {
    let targetFolderId = target_folder_id || null; // null = "Beats"

    await pool.query(
      `UPDATE generated_songs
       SET folder_id = $1
       WHERE user_id = $2 AND song_id = $3`,
      [targetFolderId, userId, song_id]
    );

    res.json({ success: true, message: "Song moved successfully" });
  } catch (err) {
    console.error("❌ Failed to move song:", err.message);
    res.status(500).json({ success: false, error: "Failed to move song" });
  }
});

 
// ✅ Delete a song from any folder or Beats
router.delete("/delete-song/:id", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  const songId = req.params.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    // Confirm the song belongs to the user
    const songCheck = await pool.query(
      `SELECT * FROM generated_songs WHERE song_id = $1 AND user_id = $2`,
      [songId, userId]
    );

    if (songCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Song not found or unauthorized" });
    }

    // Delete the song
    await pool.query(`DELETE FROM generated_songs WHERE song_id = $1`, [songId]);

    res.json({ success: true, message: "Song deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting song:", err.message);
    res.status(500).json({ success: false, error: "Failed to delete song" });
  }
});



module.exports = router;


