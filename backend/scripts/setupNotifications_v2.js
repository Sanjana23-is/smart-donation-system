const db = require('../db');

async function setup() {
    try {
        console.log("Recreating notifications table...");

        // Drop existing table to ensure strict schema compliance
        await db.query("DROP TABLE IF EXISTS notifications");

        await db.query(`
      CREATE TABLE notifications (
        notificationId INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('approved', 'rejected', 'info') DEFAULT 'info',
        isRead BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (userId)
      )
    `);

        console.log("✅ Notifications table created successfully with new schema.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up notifications:", err);
        process.exit(1);
    }
}

setup();
