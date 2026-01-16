const express = require("express");
const router = express.Router();
const db = require("../db");

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM admin_users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    res.json({
      message: "Admin login successful",
      admin: rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
