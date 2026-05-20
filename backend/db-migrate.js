require("dotenv").config();
const mysql = require("mysql2/promise");

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "12345678",
    database: process.env.DB_NAME || "donation_db",
  });

  try {
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN otp VARCHAR(6) NULL,
      ADD COLUMN otp_expiry DATETIME NULL;
    `);
    console.log("Migration successful: Added columns to users table.");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME") {
      console.log("Columns already exist.");
    } else {
      console.error("Migration failed:", err);
    }
  } finally {
    await connection.end();
  }
}

migrate();
