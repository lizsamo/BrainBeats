// testDB.js
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST, // Ensure this is the correct public DNS
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
    key: fs.readFileSync(process.env.DB_SSL_KEY).toString(),
    cert: fs.readFileSync(process.env.DB_SSL_CERT).toString(),
    servername: '9-e86289c0-33e4-4507-9962-f716e9628115.us-west1.sql.goog' // Add this
  }
});

async function testDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('🕒 Current time from DB:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  }
}

testDB();
