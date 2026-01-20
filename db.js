// const mysql = require('mysql2/promise');
// const dotenv = require('dotenv');
// dotenv.config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',  // use your actual MySQL password
//   database: process.env.DB_NAME || 'donation_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = pool;

// db.js — Handles MySQL database connection

const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// ✅ Create MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,       // e.g. localhost
  port: process.env.DB_PORT,       // usually 3306
  user: process.env.DB_USER,       // e.g. root
  password: process.env.DB_PASSWORD, // from your .env
  database: process.env.DB_NAME,     // e.g. donation_db
});

// ✅ Attempt connection
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL successfully');
  }
});

// ✅ Export the connection for use in other files
module.exports = db;

