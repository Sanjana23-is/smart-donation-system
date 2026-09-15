const express = require("express");
const router = express.Router();
const db = require("../db");
const userAuth = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");

function generateUID() {
  return "DON-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

// ADD DONATION (Authenticated User)
router.post("/", userAuth, async (req, res) => {
  try {
    const { donorId, donationType, amount, method, paymentReference } = req.body;

    if (!donorId || !donationType) {
      return res.status(400).json({ error: "donorId and donationType required" });
    }

    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(403).json({ error: "User ID not found in token" });
    }

    // Verify that donorId belongs to the authenticated user
    const [donorRows] = await db.query(
      "SELECT donorId FROM donors WHERE donorId = ? AND userId = ?",
      [donorId, userId]
    );

    if (donorRows.length === 0) {
      return res.status(403).json({
        error: "Invalid donor ID or you do not have permission to donate under this donor profile."
      });
    }

    // Validate amount as a positive finite number
    const numericAmount = Number(amount);
    if (
      typeof amount === "undefined" ||
      amount === null ||
      amount === "" ||
      isNaN(numericAmount) ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({ error: "Donation amount must be a positive number" });
    }

    const uid = generateUID();

    // barcode ONLY for product donation
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
        numericAmount,
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

// GET USER DONATIONS (Authenticated User)
router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(403).json({ error: "User ID not found in token" });
    }

    const [rows] = await db.query(
      `SELECT 
        dn.donationId,
        dn.donorId,
        dn.donationDate,
        dn.donationType,
        dn.amount,
        dn.method,
        dn.status,
        dn.uid,
        dn.barcode,
        dn.paymentReference,
        dn.donatedAt
      FROM donations dn
      INNER JOIN donors d ON dn.donorId = d.donorId
      WHERE d.userId = ?
      ORDER BY dn.donationId DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR FETCHING USER DONATIONS:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET ALL DONATIONS (Admin Only)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        dn.donationId,
        dn.donorId,
        dn.donationDate,
        dn.donationType,
        dn.amount,
        dn.method,
        dn.status,
        dn.uid,
        dn.barcode,
        dn.paymentReference,
        dn.donatedAt,
        d.name AS donorName,
        d.email AS donorEmail
      FROM donations dn
      LEFT JOIN donors d ON dn.donorId = d.donorId
      ORDER BY dn.donationId DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR FETCHING ADMIN DONATIONS:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
