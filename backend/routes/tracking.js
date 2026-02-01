// backend/routes/tracking.js
const express = require("express");
const router = express.Router();
const db = require("../db");

/* ===============================
   ADD DISPATCH / DELIVERY EVENT
================================ */
router.post("/redirect", async (req, res) => {
  const {
    inventoryId,
    toLocation,
    dispatchDate,
    deliveredDate,
  } = req.body;

  if (!inventoryId || !toLocation || !dispatchDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [[inv]] = await db.query(
      `SELECT uid FROM inventories WHERE inventoryId = ?`,
      [inventoryId]
    );

    if (!inv) {
      return res.status(404).json({ error: "Inventory not found" });
    }

    await db.query(
      `INSERT INTO trackinghistory
       (uid, inventoryId, status, fromLocation, toLocation,
        dispatchDate, deliveredDate, createdAt)
       VALUES (?, ?, ?, 'Main Warehouse', ?, ?, ?, NOW())`,
      [
        inv.uid,
        inventoryId,
        deliveredDate ? "delivered" : "dispatched",
        toLocation,
        dispatchDate,
        deliveredDate || null,
      ]
    );

    res.json({ message: "Tracking updated successfully" });
  } catch (err) {
    console.error("❌ TRACKING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET FULL TRACKING BY UID
================================ */
router.get("/:uid", async (req, res) => {
  const uid = req.params.uid;

  const [rows] = await db.query(
    `SELECT *
     FROM trackinghistory
     WHERE uid = ?
     ORDER BY createdAt ASC`,
    [uid]
  );

  if (!rows.length) {
    return res.status(404).json({ error: "No tracking found" });
  }

  res.json(rows);
});

module.exports = router;
