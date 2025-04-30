// // db.js

// const { Pool } = require('pg');
// const fs = require('fs');
// require('dotenv').config();

// const pool = new Pool({
//   host: process.env.DB_HOST, // Ensure this is the correct public DNS
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   ssl: {
//     rejectUnauthorized: true,
//     ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
//     key: fs.readFileSync(process.env.DB_SSL_KEY).toString(),
//     cert: fs.readFileSync(process.env.DB_SSL_CERT).toString(),
//     servername: '9-e86289c0-33e4-4507-9962-f716e9628115.us-west1.sql.goog' // Add this
//   }
// });

// module.exports = { pool };

// db.js - Database connection configuration

const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();
// Create connection pool based on environment variables or default config
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DB_SSL_CA).toString(),
    key: fs.readFileSync(process.env.DB_SSL_KEY).toString(),
    cert: fs.readFileSync(process.env.DB_SSL_CERT).toString(),
    servername: '9-e86289c0-33e4-4507-9962-f716e9628115.us-west1.sql.goog' // Add this
  }
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Export pool for use in other files
module.exports = { pool };
