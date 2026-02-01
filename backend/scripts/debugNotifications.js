const db = require('../db');

async function debugData() {
    try {
        console.log("--- 1. Database Connection ---");
        // db.js handles connection, assuming it's correct from previous steps, but let's confirm DB name
        const [dbName] = await db.query("SELECT DATABASE() as db");
        console.log("Connected to DB:", dbName[0].db);

        console.log("\n--- 2. Recent Notifications ---");
        const [notifs] = await db.query("SELECT * FROM notifications ORDER BY createdAt DESC LIMIT 5");
        console.log(notifs);

        console.log("\n--- 3. Donated Products (Pending/Approved) ---");
        const [products] = await db.query("SELECT productId, productName, donorId, status FROM donatedProducts ORDER BY donatedAt DESC LIMIT 5");
        console.log(products);

        console.log("\n--- 4. Users Table ---");
        try {
            const [users] = await db.query("SELECT userId, email FROM users LIMIT 5");
            console.log(users);
        } catch (e) { console.log("Users table error:", e.message); }

        console.log("\n--- 5. Donors Table ---");
        try {
            const [donors] = await db.query("SELECT donorId, email FROM donors LIMIT 5");
            console.log(donors);
        } catch (e) { console.log("Donors table error:", e.message); }

        process.exit(0);
    } catch (err) {
        console.error("Debug Error:", err);
        process.exit(1);
    }
}

debugData();
