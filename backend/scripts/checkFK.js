const db = require('../db');

async function checkFK() {
    try {
        const [rows] = await db.query("SHOW CREATE TABLE donatedProducts");
        console.log(rows[0]['Create Table']);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkFK();
