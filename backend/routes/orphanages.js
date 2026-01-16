const express = require("express");
const router = express.Router();
const db = require("../db");

// 📌 Get all orphanages (Admin + User)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM orphanages ORDER BY orphanageId DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add orphanage (Admin only)
router.post("/", async (req, res) => {
  try {
    const { name, location, contactPerson } = req.body;

    const [result] = await db.query(
      "INSERT INTO orphanages (name, location, contactPerson) VALUES (?, ?, ?)",
      [name, location, contactPerson]
    );

    res.status(201).json({ orphanageId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
