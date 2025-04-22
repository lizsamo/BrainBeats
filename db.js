// db.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'denisem',
  host: '35.199.150.246',
  database: 'brainbeats',
  password: '$Uv&UBeDMoAJ/Xy', // <-- replace with your actual DB password or use env vars
  port: 5432,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/home/vboxuser/Documents/sll/server-ca.pem').toString(),
    key: fs.readFileSync('/home/vboxuser/Documents/sll/client-key.pem').toString(),
    cert: fs.readFileSync('/home/vboxuser/Documents/sll/client-cert.pem').toString(),
  },
});

// Function to verify the database connection
async function verifyConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to the database:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err.stack);
    process.exit(1); // Exit the application if the connection fails
  }
}

// Verify the connection when the application starts
verifyConnection();

// Optional: Handle unexpected errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1); // Exit the application on unexpected errors
});

module.exports = pool;
