const db = require('./db');

async function migrate() {
  try {
    console.log("Starting profile migration...");

    // Add phone column
    try {
      await db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL");
      console.log("Added phone column.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log("phone column already exists.");
      else throw e;
    }

    // Add address column
    try {
      await db.query("ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL");
      console.log("Added address column.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log("address column already exists.");
      else throw e;
    }

    // Add privacy and notification toggles
    try {
      await db.query("ALTER TABLE users ADD COLUMN donations_anonymous BOOLEAN DEFAULT false");
      console.log("Added donations_anonymous column.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log("donations_anonymous column already exists.");
      else throw e;
    }

    try {
      await db.query("ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN DEFAULT true");
      console.log("Added notifications_enabled column.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log("notifications_enabled column already exists.");
      else throw e;
    }

    console.log("Migration successful!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
