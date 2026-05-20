const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM admin_users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const admin = rows[0];

    // ✅ generate token
    const token = jwt.sign(
      { id: admin.adminId, username: admin.username, role: "admin" },
      "SECRET_KEY_ADMIN",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: {
        adminId: admin.adminId,
        username: admin.username,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update Password
router.put("/password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "SECRET_KEY_ADMIN");
    const adminId = decoded.id;

    const { currentPassword, newPassword } = req.body;

    // verify current password
    const [rows] = await db.query("SELECT * FROM admin_users WHERE adminId = ? AND password = ?", [adminId, currentPassword]);
    
    if (rows.length === 0) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    // update password
    await db.query("UPDATE admin_users SET password = ? WHERE adminId = ?", [newPassword, adminId]);

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Admin password update error:", err);
    res.status(500).json({ error: "Server error or invalid token" });
  }
});

module.exports = router;
