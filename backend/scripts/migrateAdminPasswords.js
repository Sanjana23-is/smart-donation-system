const bcrypt = require("bcryptjs");
const db = require("../db");

async function migrateAdminPasswords() {
  console.log("🔒 Starting admin password migration...");

  try {
    const [admins] = await db.query(
      "SELECT adminId, username, password FROM admin_users"
    );

    if (!admins || admins.length === 0) {
      console.log("ℹ️ No admin records found to migrate.");
      return;
    }

    console.log(`📋 Found ${admins.length} admin record(s). Processing...`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const admin of admins) {
      const { adminId, username, password } = admin;

      // Check if the password is already a valid bcrypt hash ($2a$, $2b$, or $2y$)
      const isAlreadyHashed =
        typeof password === "string" &&
        (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$")) &&
        password.length >= 60;

      if (isAlreadyHashed) {
        console.log(`⏩ Admin [ID: ${adminId}, Username: ${username}] already has a bcrypt hash. Skipped.`);
        skippedCount++;
        continue;
      }

      // Hash plaintext password using bcryptjs with cost factor 12
      const hashedPassword = await bcrypt.hash(password, 12);

      await db.query(
        "UPDATE admin_users SET password = ? WHERE adminId = ?",
        [hashedPassword, adminId]
      );

      console.log(`✅ Migrated password for admin [ID: ${adminId}, Username: ${username}].`);
      migratedCount++;
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   Total records: ${admins.length}`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Skipped (already hashed): ${skippedCount}`);
    console.log("🎉 Admin password migration completed successfully.");
  } catch (err) {
    console.error("❌ Migration failed with error:", err.message);
    process.exitCode = 1;
  } finally {
    try {
      await db.end();
    } catch (closeErr) {
      // Suppress pool close error if already closed
    }
  }
}

if (require.main === module) {
  migrateAdminPasswords();
}

module.exports = migrateAdminPasswords;
