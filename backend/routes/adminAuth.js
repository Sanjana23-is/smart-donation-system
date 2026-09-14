const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../config/jwt");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch admin by username only — never compare password in SQL
    const [rows] = await db.query(
      "SELECT * FROM admin_users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const admin = rows[0];

    // ✅ bcrypt comparison against hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // ✅ generate token
    const token = jwt.sign(
      { adminId: admin.adminId, id: admin.adminId, username: admin.username, role: "admin" },
      JWT_SECRET,
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
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminId = decoded.adminId;

    const { currentPassword, newPassword } = req.body;

    // Fetch admin to verify current password via bcrypt
    const [rows] = await db.query("SELECT * FROM admin_users WHERE adminId = ?", [adminId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // ✅ bcrypt comparison
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    // ✅ hash new password before storing
    const hashedNew = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE admin_users SET password = ? WHERE adminId = ?", [hashedNew, adminId]);

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Admin password update error:", err);
    res.status(500).json({ error: "Server error or invalid token" });
  }
});

module.exports = router;

