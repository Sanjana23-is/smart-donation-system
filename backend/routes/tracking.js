const express = require("express");
const router = express.Router();
const db = require("../db");

// ------------------------------------------
// SAVE REDIRECT / DISPATCH ENTRY
// POST /api/tracking/redirect
// ------------------------------------------
router.post("/redirect", async (req, res) => {
  try {
    const {
      inventoryId,
      dispatchToType,
      dispatchToId,
      dispatchDate,
      deliveredDate
    } = req.body;

    // Basic validation
    if (!inventoryId || !dispatchToType || !dispatchToId || !dispatchDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔹 Fetch UID from inventories (CRITICAL FIX)
    const [[inv]] = await db.query(
      "SELECT uid FROM inventories WHERE inventoryId = ?",
      [inventoryId]
    );

    if (!inv) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    // 🔹 Insert tracking history WITH UID
    await db.query(
      `INSERT INTO trackinghistory
       (inventoryId, uid, dispatchFrom, dispatchTo, dispatchToType,
        dispatchDate, deliveredDate, status)
       VALUES (?, ?, 'Main Warehouse', ?, ?, ?, ?, ?)`,
      [
        inventoryId,
        inv.uid,
        dispatchToId,
        dispatchToType,
        dispatchDate,
        deliveredDate || null,
        deliveredDate ? "delivered" : "dispatched"
      ]
    );

    res.json({ message: "Tracking redirect saved successfully" });

  } catch (err) {
    console.error("❌ TRACKING REDIRECT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------
// GET FULL TRACKING HISTORY BY UID
// GET /api/tracking/:uid
// ------------------------------------------
router.get("/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;

    const [rows] = await db.query(
      `SELECT *
       FROM trackinghistory
       WHERE uid = ?
       ORDER BY createdAt ASC`,
      [uid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No tracking history found for this UID" });
    }

    res.json(rows);

  } catch (err) {
    console.error("❌ FETCH TRACKING HISTORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
