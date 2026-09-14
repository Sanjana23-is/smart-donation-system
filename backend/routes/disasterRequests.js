// backend/routes/disasterRequests.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");
const userAuth = require("../middleware/userAuth");

// Generate UID for disaster request
function generateUID() {
  return "DR-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

// GET disaster requests for logged-in user
router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(403).json({ error: "User ID not found in token" });
    }

    const [rows] = await db.query(
      `SELECT dr.*, d.disasterType AS disasterName
       FROM disasterrequests dr
       LEFT JOIN disasters d ON dr.disasterId = d.disasterId
       WHERE dr.userId = ?
       ORDER BY dr.requestId DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR GETTING USER REQUESTS:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all disaster requests (Admin only)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT dr.*, d.disasterType AS disasterName
      FROM disasterrequests dr
      LEFT JOIN disasters d ON dr.disasterId = d.disasterId
      ORDER BY dr.requestId DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR GETTING ADMIN REQUESTS:", err);
    res.status(500).json({ error: err.message });
  }
});

// SUBMIT new request (user)
router.post("/", userAuth, async (req, res) => {
  try {
    const { disasterId, requestedItem, quantity, unit } = req.body;

    if (!disasterId || !requestedItem || !quantity || !unit) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userId = req.user.userId;
    if (!userId) {
      return res.status(403).json({ error: "User ID not found in token" });
    }

    const uid = generateUID();
    const barcode = uid; // same for scanning later

    const [result] = await db.query(
      `INSERT INTO disasterrequests 
       (userId, disasterId, requestedItem, quantity, unit, fulfilled, status, uid, barcode)
       VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?)`,
      [userId, disasterId, requestedItem, quantity, unit, uid, barcode]
    );

    res.status(201).json({
      message: "Request submitted",
      requestId: result.insertId,
      uid,
      barcode
    });

  } catch (err) {
    console.error("❌ ERROR SUBMITTING REQUEST:", err);
    res.status(500).json({ error: err.message });
  }
});

// APPROVE → move to inventory
router.put("/:id/approve", adminAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // mark request approved
    await db.query(
      "UPDATE disasterrequests SET fulfilled = 1, status='approved' WHERE requestId=?",
      [id]
    );

    // fetch the original request (includes original uid)
    const [rows] = await db.query(
      `SELECT dr.*, d.disasterType AS disasterName
       FROM disasterrequests dr
       LEFT JOIN disasters d ON dr.disasterId = d.disasterId
       WHERE dr.requestId = ?`,
      [id]
    );

    const r = rows[0];
    if (!r) return res.status(404).json({ error: "Request not found" });

    // Use the original UID from disasterrequests.uid when inserting into inventories
    await db.query(
      `INSERT INTO inventories
         (sourceType, disasterRequestId, productName, quantity, unit, uid, location, status, disasterName)
       VALUES ('disaster', ?, ?, ?, ?, ?, 'Main Warehouse', 'received', ?)`,
      [r.requestId, r.requestedItem, r.quantity, r.unit, r.uid, r.disasterName]
    );

    res.json({ message: "Request approved & added to inventory" });

  } catch (err) {
    console.error("❌ APPROVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// REJECT
router.put("/:id/reject", adminAuth, async (req, res) => {
  try {
    await db.query(
      "UPDATE disasterrequests SET fulfilled = 2, status='rejected' WHERE requestId=?",
      [req.params.id]
    );
    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error("❌ REJECT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
