const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'eliszam',
  host: '35.199.150.246',
  database: 'brainbeats',
  password: 'iTl38Z+rfaUYC[xa', // <-- replace with your actual DB password or use env vars
  port: 5432,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('C:\\Users\\lizsa\\Documents\\SSL\\server-ca.pem').toString(),
    key: fs.readFileSync('C:\\Users\\lizsa\\Documents\\SSL\\client-key.pem').toString(),
    cert: fs.readFileSync('C:\\Users\\lizsa\\Documents\\SSL\\client-cert.pem').toString(),
  },
});

module.exports = pool;