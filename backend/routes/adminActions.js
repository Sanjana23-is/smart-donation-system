const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/pending-products", async (req, res) => {
  const [rows] = await db.query(`
    SELECT * FROM donatedProducts
    WHERE status = 'pending'
    ORDER BY donatedAt DESC
  `);
  res.json(rows);
});

router.put("/product/:id/decision", async (req, res) => {
  const productId = req.params.id;
  const { decision, adminRemark } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
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
       (sourceType, productId, productName, quantity, unit, location, status, uid, perishable, manufactureDate, expiryDate)
       VALUES ('product', ?, ?, ?, ?, 'Main Warehouse', 'received', ?, ?, ?, ?)`,
      [
        p.productId,
        p.productName,
        p.quantity,
        p.unit,
        p.uid,
        p.perishable,
        p.manufactureDate,
        p.expiryDate,
      ]
    );

    const inventoryId = invResult.insertId;

    // 4️⃣ Tracking history
    await db.query(
      `INSERT INTO trackinghistory
       (uid, inventoryId, sourceType, productName, status, toName, createdAt)
       VALUES (?, ?, 'product', ?, 'Created', 'Admin', NOW())`,
      [p.uid, inventoryId, p.productName]
    );

    res.json({
      message: "Product approved and moved to inventory",
      inventoryId,
    });
  } catch (err) {
    console.error("ERROR admin decision:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// APPROVE / REJECT MONEY DONATION
// ===============================
router.put("/donation/:id/decision", async (req, res) => {
  const donationId = req.params.id;
  const { decision } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  try {
    await db.query(
      `UPDATE donations SET status = ? WHERE donationId = ?`,
      [decision, donationId]
    );

    res.json({ message: `Donation ${decision}` });
  } catch (err) {
    console.error("❌ ERROR donation decision:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
