// backend_js/b_loginPage-script.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

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

        // ✅ Create session
        const sessionToken = uuidv4();
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await pool.query(
            `INSERT INTO user_sessions (user_id, session_token, is_active, login_time, ip_address, user_agent)
             VALUES ($1, $2, TRUE, NOW(), $3, $4)`,
            [user.user_id, sessionToken, ip, userAgent]
        );

        console.log(`✅ Session created for user: ${email}`);
        return res.json({ success: true, sessionToken });

    } catch (err) {
        console.error("❌ Login error:", err.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
});

module.exports = router;
