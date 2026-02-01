const db = require('../db');

async function setup() {
    try {
        console.log("Checking for users table...");
        const [usersExist] = await db.query("SHOW TABLES LIKE 'users'");
        let foreignKeySQL = "";

        if (usersExist.length > 0) {
            console.log("Users table exists. Using userid FK.");
            // Check column name in users
            const [columns] = await db.query("SHOW COLUMNS FROM users");
            const idColumn = columns.find(c => c.Field === 'userId' || c.Field === 'id');
            if (idColumn) {
                console.log(`User ID column is ${idColumn.Field}`);
                // We'll use donorId as the column name in notifications for consistency with other tables, 
                // but it references users.userId
                // Actually, let's call it donorId to match existing pattern, but clarify it links to users.
                // However, if the app distinguishes donors vs users independently...
                // auth.js registers to 'users'. donors.js manages 'donors'.
                // adminActions uses 'product' which has 'donorId'.
                // We will create the table with donorId.
            }
        } else {
            console.log("Users table NOT found. Checking donors...");
            const [donorsExist] = await db.query("SHOW TABLES LIKE 'donors'");
            if (donorsExist.length > 0) {
                console.log("Donors table exists.");
            }
        }

        console.log("Creating notifications table...");
        await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        donorId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        isRead BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (donorId)
      )
    `);
        console.log("✅ Notifications table created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up notifications:", err);
        process.exit(1);
    }
}

setup();
