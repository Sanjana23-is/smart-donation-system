const db = require('../db');

async function checkSchema() {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM trackinghistory");
        console.log("Columns in trackinghistory:");
        columns.forEach(c => console.log(c.Field));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

checkSchema();
