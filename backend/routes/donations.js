const express = require("express");
const router = express.Router();
const db = require("../db");

function generateUID() {
  return "DON-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

// ADD DONATION
router.post("/", async (req, res) => {
  try {
    const { donorId, donationType, amount, method, paymentReference } = req.body;

    if (!donorId || !donationType) {
      return res.status(400).json({ error: "donorId and donationType required" });
    }

    const uid = generateUID();

    // ✅ barcode ONLY for product donation
    const isProduct = donationType.toLowerCase() === "product";
    const barcode = isProduct ? uid : null;

    const [result] = await db.query(
      `INSERT INTO donations
      (donorId, donationDate, donationType, amount, method, donatedAt,
       status, uid, barcode, paymentReference)
      VALUES (?, CURDATE(), ?, ?, ?, NOW(),
      'pending', ?, ?, ?)`,
      [
        donorId,
        donationType.toLowerCase(),
        amount || null,
        method || null,
        uid,
        barcode,
        paymentReference || null,
      ]
    );

    res.json({
      message: "Donation added successfully",
      donationId: result.insertId,
      uid,
      barcode,
    });
  } catch (err) {
    console.error("❌ ERROR ADDING DONATION:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET DONATIONS
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        donationId,
        donorId,
        donationType,
        amount,
        method,
        status,
        uid,
        barcode,
        paymentReference,
        donatedAt
      FROM donations
      ORDER BY donationId DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR FETCHING DONATIONS:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
