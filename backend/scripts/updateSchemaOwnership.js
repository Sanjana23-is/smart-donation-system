const db = require('../db');

async function setup() {
    try {
        console.log("Updating database schema for user ownership...");

        // 1. Add userId column to donors table if not exists
        try {
            await db.query(`ALTER TABLE donors ADD COLUMN userId INT`);
            console.log("✅ Added userId column to donors table");

            // Attempt to add FK, but don't fail if it exists or fails due to data
            try {
                await db.query(`ALTER TABLE donors ADD FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE SET NULL`);
                console.log("✅ Added FK (userId) to donors table");
            } catch (e) {
                console.log("ℹ️ FK on donors(userId) might already exist or data mismatch:", e.message);
            }
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ userId column already exists in donors");
            } else {
                throw e;
            }
        }

        // 2. Add userId column to donatedProducts if not exists
        // This is CRITICAL for notifications: knowing WHICH USER donated the product directly.
        try {
            await db.query(`ALTER TABLE donatedProducts ADD COLUMN userId INT`);
            console.log("✅ Added userId column to donatedProducts table");

            try {
                await db.query(`ALTER TABLE donatedProducts ADD FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE SET NULL`);
                console.log("✅ Added FK (userId) to donatedProducts table");
            } catch (e) { console.log("ℹ️ FK on donatedProducts(userId) might already exist:", e.message); }

        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ userId column already exists in donatedProducts");
            } else {
                throw e;
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Schema Update Error:", err);
        process.exit(1);
    }
}

setup();
