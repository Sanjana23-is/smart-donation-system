// db.js — MySQL connection using Promise wrapper

const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// ✅ Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Use promise wrapper (important!)
const db = pool.promise();

// ✅ Test connection once
db.query('SELECT 1')
  .then(() => console.log('✅ Connected to MySQL successfully (Promise)'))
  .catch((err) => console.error('❌ MySQL connection failed:', err.message));

module.exports = db;
