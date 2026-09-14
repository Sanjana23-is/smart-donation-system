const express = require("express");
const router = express.Router();
const db = require("../db");
const userAuth = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");

// GET donor profile(s) for authenticated user
router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(403).json({ error: "User ID not found in token" });
    }

    const [rows] = await db.query(
      "SELECT * FROM donors WHERE userId = ? ORDER BY donorId DESC",
      [userId]
    );
    res.json(rows || []);
  } catch (err) {
    console.error("❌ DONORS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all donors (Admin only)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM donors ORDER BY donorId DESC");
    res.json(rows || []);
  } catch (err) {
    console.error("❌ ADMIN DONORS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ADD donor (Authenticated user)
router.post("/", userAuth, async (req, res) => {
  try {
    const { name, email, phoneNumber, address } = req.body;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(403).json({ error: "User ID not found in token" });
    }

    if (!name || !email || !phoneNumber || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [result] = await db.query(
      "INSERT INTO donors (userId, name, email, phoneNumber, address) VALUES (?, ?, ?, ?, ?)",
      [userId, name, email, phoneNumber, address]
    );
    res.status(201).json({ donorId: result.insertId });
  } catch (err) {
    console.error("❌ ADD DONOR ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE donor (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await db.query("DELETE FROM donors WHERE donorId = ?", [req.params.id]);
    res.json({ message: "Donor deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE DONOR ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
