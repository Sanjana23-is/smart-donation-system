const express = require("express");
const router = express.Router();
const db = require("../db");

/* ===============================
   GET PENDING PRODUCTS
================================ */
router.get("/pending-products", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM donatedProducts
      WHERE status = 'pending'
      ORDER BY donatedAt DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ FETCH PENDING PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch pending products" });
  }
});

/* ===============================
   APPROVE / REJECT PRODUCT
   (USES productId — NOT uid)
================================ */
router.put("/product/:id/decision", async (req, res) => {
  const productId = Number(req.params.id);
  const { decision, adminRemark } = req.body;

  // 🔒 Hard validation
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  try {
    /* ---------- 1. UPDATE PRODUCT STATUS ---------- */
    const [updateResult] = await db.query(
      `UPDATE donatedProducts
       SET status = ?, admin_remark = ?
       WHERE productId = ?`,
      [decision, adminRemark || null, productId]
    );

    // 🚨 CRITICAL GUARD (THIS WAS MISSING)
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ---------- 2. STOP HERE IF REJECTED ----------
    if (decision === "rejected") {
      return res.json({ message: "Product rejected by admin" });
    }

    /* ---------- 3. FETCH APPROVED PRODUCT ---------- */
    const [[product]] = await db.query(
      "SELECT * FROM donatedProducts WHERE productId = ?",
      [productId]
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found after update" });
    }

    /* ---------- 4. INSERT INTO INVENTORY ---------- */
    const [invResult] = await db.query(
      `INSERT INTO inventories
       (sourceType, productId, productName, quantity, unit,
        location, status, uid, perishable,
        manufactureDate, expiryDate)
       VALUES ('product', ?, ?, ?, ?, 'Main Warehouse',
               'received', ?, ?, ?, ?)`,
      [
        product.productId,
        product.productName,
        product.quantity,
        product.unit,
        product.uid,
        product.perishable,
        product.manufactureDate,
        product.expiryDate,
      ]
    );

    const inventoryId = invResult.insertId;

    /* ---------- 5. TRACKING HISTORY ---------- */
    await db.query(
      `INSERT INTO trackinghistory
    (uid, inventoryId, status, fromLocation, toLocation, createdAt)
    VALUES (?, ?, 'approved', 'Donor', 'Main Warehouse', NOW())
`,
      [product.uid, inventoryId, product.productName]
    );

    res.json({
      message: "Product approved and moved to inventory",
      inventoryId,
    });
  } catch (err) {
    console.error("❌ ADMIN PRODUCT DECISION ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ===============================
   APPROVE / REJECT MONEY DONATION
================================ */
router.put("/donation/:id/decision", async (req, res) => {
  const donationId = Number(req.params.id);
  const { decision } = req.body;

  if (!Number.isInteger(donationId)) {
    return res.status(400).json({ error: "Invalid donationId" });
  }

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  try {
    const [result] = await db.query(
      `UPDATE donations SET status = ? WHERE donationId = ?`,
      [decision, donationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    res.json({ message: `Donation ${decision}` });
  } catch (err) {
    console.error("❌ DONATION DECISION ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
