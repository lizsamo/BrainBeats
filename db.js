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

module.exports = pool;
