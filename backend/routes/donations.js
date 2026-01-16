// backend/routes/donations.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// UID Generator (used when users add donations)
function generateUID() {
  return "DON-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

// USER — Add donation (returns uid + barcode)
router.post("/", async (req, res) => {
  try {
    const { donorId, amount, method, donationType, paymentReference } = req.body;

    if (!donorId || !amount || !method || !donationType) {
      return res.status(400).json({
        error: "donorId, amount, method, donationType are required",
      });
    }

    const uid = generateUID();
    const barcode = uid;

    const [result] = await db.query(
      `INSERT INTO donations 
       (donorId, donationDate, donationType, amount, method, donatedAt, status, uid, barcode, paymentReference)
       VALUES (?, CURDATE(), ?, ?, ?, NOW(), 'pending', ?, ?, ?)`,
      [donorId, donationType, amount, method, uid, barcode, paymentReference || null]
    );

    res.json({
      message: "Donation added",
      donationId: result.insertId,
      uid,
      barcode,
    });
  } catch (err) {
    console.error("❌ ERROR ADDING DONATION:", err);
    res.status(500).json({ error: err.message });
  }
});

// LIST donations
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM donations ORDER BY donationId DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// APPROVE donation
router.put("/:id/approve", async (req, res) => {
  try {
    const donationId = req.params.id;

    await db.query("UPDATE donations SET status='approved' WHERE donationId=?", [
      donationId,
    ]);

    const [rows] = await db.query(
      "SELECT * FROM donations WHERE donationId=?",
      [donationId]
    );
    const d = rows[0];

    if (!d) return res.status(404).json({ error: "Donation not found" });

    // Insert into inventories (correct order as per table)
    await db.query(
      `INSERT INTO inventories 
       (productId, productName, location, quantity, unit, status,
        donationId, disasterRequestId, sourceType, amount, method,
        disasterName, requestedItem, uid)
       VALUES 
       (NULL, NULL, 'Main Warehouse', NULL, NULL, 'received',
        ?, NULL, 'donation', ?, ?, NULL, NULL, ?)`,
      [d.donationId, d.amount, d.method, d.uid]
    );

    res.json({ message: "Donation approved & added to inventory" });
  } catch (err) {
    console.error("❌ ERROR APPROVING DONATION:", err);
    res.status(500).json({ error: err.message });
  }
});

// REJECT donation
router.put("/:id/reject", async (req, res) => {
  try {
    await db.query(
      "UPDATE donations SET status='rejected' WHERE donationId=?",
      [req.params.id]
    );
    res.json({ message: "Donation rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
