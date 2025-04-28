const { Pool } = require('pg');
require('dotenv').config();

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render typically requires SSL for PostgreSQL connections
  ssl: {
    rejectUnauthorized: false // Necessary for Render free tier DBs
  }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database.');
  // Optionally run a simple query to test
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release client back to pool
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    // console.log('Current time from DB:', result.rows[0].now);
  });
});

module.exports = { pool };