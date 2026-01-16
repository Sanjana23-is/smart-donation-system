// routes/inventories.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET ALL INVENTORIES
// GET ALL INVENTORIES
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.inventoryId,
        i.productId,
        i.productName,
        i.location,
        i.quantity,
        i.unit,
        i.status,
        i.donationId,
        i.disasterRequestId,
        i.sourceType,
        i.amount,
        i.method,
        i.uid,
        i.perishable,
        i.manufactureDate,
        i.expiryDate,

        CASE
          WHEN i.perishable = 1 AND i.expiryDate IS NOT NULL
            THEN DATEDIFF(i.expiryDate, CURDATE())
          ELSE NULL
        END AS daysToExpiry,

        dr.requestedItem,
        dr.quantity AS drQuantity,
        dr.unit AS drUnit,
        d.disasterType,
        d.location AS disasterLocation,
        dp.productName AS donatedProductName

      FROM inventories i
      LEFT JOIN disasterrequests dr ON i.disasterRequestId = dr.requestId
      LEFT JOIN disasters d ON dr.disasterId = d.disasterId
      LEFT JOIN donatedproducts dp ON i.productId = dp.productId
      ORDER BY i.inventoryId DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ INVENTORY LOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
