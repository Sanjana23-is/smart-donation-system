const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================================================
   1️⃣ ADMIN VIEW: PRODUCTS PENDING REVIEW
========================================================= */
router.get("/pending-products", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        productId,
        productName,
        category,
        quantity,
        unit,
        item_image,
        ai_status,
        ai_confidence,
        status,
        donatedAt
      FROM donatedProducts
      WHERE status = 'pending'
      ORDER BY donatedAt DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("ERROR fetching pending products:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   2️⃣ ADMIN DECISION: APPROVE / REJECT PRODUCT
========================================================= */
router.put("/product/:id/decision", async (req, res) => {
  const productId = req.params.id;
  const { decision, adminRemark } = req.body;

  if (!decision || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  try {
    // 1️⃣ Update product status
    await db.query(
      `UPDATE donatedProducts
       SET status = ?, admin_remark = ?
       WHERE productId = ?`,
      [decision, adminRemark || null, productId]
    );

    if (decision === "rejected") {
      return res.json({ message: "Product rejected by admin" });
    }

    // 2️⃣ Fetch approved product
    const [[p]] = await db.query(
      "SELECT * FROM donatedProducts WHERE productId = ?",
      [productId]
    );

    if (!p) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 3️⃣ Insert into inventory
    const [invResult] = await db.query(
      `INSERT INTO inventories
       (sourceType, productId, productName, quantity, unit, location, status, uid)
       VALUES ('product', ?, ?, ?, ?, 'Main Warehouse', 'received', ?)`,
      [p.productId, p.productName, p.quantity, p.unit, p.uid]
    );

    const inventoryId = invResult.insertId;

    // 4️⃣ Tracking entry (FIXED)
    await db.query(
      `INSERT INTO trackinghistory
       (uid, inventoryId, sourceType, productName, status, toName, createdAt)
       VALUES (?, ?, 'product', ?, 'Created', 'Admin', NOW())`,
      [p.uid, inventoryId, p.productName]
    );

    res.json({
      message: "Product approved by admin",
      inventoryId,
    });
  } catch (err) {
    console.error("ERROR admin decision:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
