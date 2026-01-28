const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../middleware/upload");
const parseImages = require("../utils/imageParser");

// UID generator
function generateUID() {
  return "DON-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

/* ===============================
   ADD MONEY DONATION (JSON)
================================ */
router.post("/", async (req, res) => {
  try {
    const { donorId, donationType, amount, method, paymentReference } = req.body;

    if (!donorId || !donationType) {
      return res.status(400).json({ error: "donorId and donationType required" });
    }

    const uid = generateUID();
    const barcode = uid;

    const [result] = await db.query(
      `INSERT INTO donations
      (donorId, donationDate, donationType, amount, method, donatedAt,
       status, uid, barcode, paymentReference)
      VALUES (?, CURDATE(), ?, ?, ?, NOW(),
      'pending', ?, ?, ?)`,
      [
        donorId,
        donationType,
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
    });
  } catch (err) {
    console.error("❌ ERROR ADDING DONATION:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ADD DONATION WITH IMAGE
================================ */
router.post("/with-image", upload.single("itemImage"), async (req, res) => {
  try {
    const { donorId, donationType, amount, method, paymentReference } = req.body;

    if (!donorId || !donationType) {
      return res.status(400).json({ error: "donorId and donationType required" });
    }

    const uid = generateUID();
    const barcode = uid;

    const imagePath = req.file ? req.file.path : null;

    const [result] = await db.query(
      `INSERT INTO donations
      (donorId, donationDate, donationType, amount, method, donatedAt,
       status, uid, barcode, paymentReference, itemImage)
      VALUES (?, CURDATE(), ?, ?, ?, NOW(),
      'pending', ?, ?, ?, ?)`,
      [
        donorId,
        donationType,
        amount || null,
        method || null,
        uid,
        barcode,
        paymentReference || null,
        imagePath,
      ]
    );

    res.json({
      message: "Donation with image added",
      donationId: result.insertId,
      uid,
      imagePath,
    });
  } catch (err) {
    console.error("❌ ERROR ADDING DONATION WITH IMAGE:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   GET ALL DONATIONS
================================ */
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
        itemImage,
        donatedAt
      FROM donations
      ORDER BY donationId DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ ADMIN DONATIONS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
