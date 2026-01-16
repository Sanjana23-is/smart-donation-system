const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

// POST /admin/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "username,password required" });

  try {
    const [rows] = await db.query("SELECT * FROM admin_users WHERE username = ?", [username]);
    if (!rows.length) return res.status(400).json({ error: "Invalid credentials" });

    const admin = rows[0];
    // if stored plaintext in your SQL, compare directly; if hashed, use bcrypt.compare
    const passMatches = admin.password === password; // change if hashed

    if (!passMatches) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ adminId: admin.adminId, role: "admin" }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    return res.json({
      message: "Admin login successful",
      token,
      admin: { adminId: admin.adminId, username: admin.username }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
