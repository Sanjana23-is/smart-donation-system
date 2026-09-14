const express = require("express");
const router = express.Router();
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");

// GET all perishable items that will expire within 30 days
router.get("/", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        inventoryId,
        productName,
        quantity,
        unit,
        manufactureDate,
        expiryDate,
        DATEDIFF(expiryDate, CURDATE()) AS daysLeft
      FROM inventories
      WHERE perishable = 1
        AND expiryDate IS NOT NULL
        AND DATEDIFF(expiryDate, CURDATE()) BETWEEN 0 AND 30
      ORDER BY expiryDate ASC
    `
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching expiry alerts:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
