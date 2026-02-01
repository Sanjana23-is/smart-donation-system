const db = require('../db');

async function checkSchema() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM notifications");
        console.log("Columns in notifications table:");
        columns.forEach(c => console.log(c.Field));
        process.exit(0);
    } catch (err) {
        console.log("Table might not exist or error:", err.message);
        process.exit(1);
    }
}

checkSchema();
