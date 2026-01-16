const express = require("express");
const router = express.Router();
const db = require("../db");

// SAVE REDIRECT ENTRY
router.post("/redirect", async (req, res) => {
  try {
    const {
      inventoryId,
      dispatchToType,
      dispatchToId,
      dispatchDate,
      deliveredDate
    } = req.body;

    if (!inventoryId || !dispatchToType || !dispatchToId || !dispatchDate) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await db.query(
      `INSERT INTO trackinghistory 
       (inventoryId, dispatchFrom, dispatchTo, dispatchToType, dispatchDate, deliveredDate, status)
       VALUES (?, 'Main Warehouse', ?, ?, ?, ?, ?)`,
      [
        inventoryId,
        dispatchToId,
        dispatchToType,
        dispatchDate,
        deliveredDate || null,
        deliveredDate ? "delivered" : "dispatched"
      ]
    );

    res.json({ message: "Redirect saved successfully!" });

  } catch (err) {
    console.error("TRACKING REDIRECT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// GET FULL TRACKING HISTORY FOR A UID
router.get("/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;

    const [rows] = await db.query(
      `SELECT * FROM trackinghistory
       WHERE uid = ?
       ORDER BY createdAt ASC`,
      [uid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "UID not found" });
    }

    res.json(rows);

  } catch (err) {
    console.error("FETCH HISTORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
