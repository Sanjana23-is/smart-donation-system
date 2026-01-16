const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all donors
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM donors ORDER BY donorId DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add donor
router.post("/", async (req, res) => {
  try {
    const { name, email, phoneNumber, address } = req.body;
    const [result] = await db.query(
      "INSERT INTO donors (name, email, phoneNumber, address) VALUES (?, ?, ?, ?)",
      [name, email, phoneNumber, address]
    );
    res.status(201).json({ donorId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete donor
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM donors WHERE donorId = ?", [req.params.id]);
    res.json({ message: "Donor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
