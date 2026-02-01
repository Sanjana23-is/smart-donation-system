const db = require('../db');

async function fixDB() {
    try {
        console.log("Removing FK constraint to allow User IDs...");
        await db.query("ALTER TABLE donatedProducts DROP FOREIGN KEY fk_donorId");
        console.log("✅ FK constraint removed.");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log("FK already removed or not found.");
            process.exit(0);
        }
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

fixDB();
