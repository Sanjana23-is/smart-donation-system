const express = require("express");
const router = express.Router();
const db = require("../db");

// ➕ Add a disaster (Admin)
router.post("/", async (req, res) => {
  try {
    const { disasterType, location, date } = req.body;

    // Insert with default status = active
    const [result] = await db.query(
      `INSERT INTO disasters (disasterType, location, date, status)
       VALUES (?, ?, ?, 'active')`,
      [disasterType, location, date]
    );

    res.status(201).json({ disasterId: result.insertId });
  } catch (err) {
    console.error("Error adding disaster:", err);
    res.status(500).json({ error: err.message });
  }
});


// 📌 Get all disasters (Admin + User)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM disasters ORDER BY disasterId DESC"
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching disasters:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✔ Admin updates status → active / resolved
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    await db.query(
      "UPDATE disasters SET status=? WHERE disasterId=?",
      [status, req.params.id]
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
