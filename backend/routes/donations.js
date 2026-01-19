const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../middleware/upload");

// UID generator
function generateUID() {
  return "DON-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

/* ===============================
   ADD DONATION WITH IMAGE
================================ */
router.post(
  "/with-image",
  upload.single("itemImage"),
  async (req, res) => {
    try {
      const { donorId, donationType, amount, method, paymentReference } = req.body;

      if (!donorId || !donationType) {
        return res.status(400).json({
          error: "donorId and donationType are required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "itemImage file is required",
        });
      }

      const uid = generateUID();
      const barcode = uid;

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
          req.file.path,
        ]
      );

      res.json({
        message: "Donation with image added",
        donationId: result.insertId,
        uid,
        imagePath: req.file.path,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// LIST donations
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM donations ORDER BY donationId DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR FETCHING DONATIONS:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
