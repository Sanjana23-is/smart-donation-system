const express = require("express");
const router = express.Router();
const db = require("../db");

/* -----------------------------
   APPROVE PRODUCT → INVENTORY + TRACKING
----------------------------- */
router.put("/approve-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // 1) Mark donated product as approved
    await db.query(
      "UPDATE donated_products SET status='approved' WHERE productId=?",
      [productId]
    );

    // 2) Fetch product (to get uid, name, qty, etc.)
    const [rows] = await db.query(
      "SELECT * FROM donated_products WHERE productId=?",
      [productId]
    );
    const p = rows[0];
    if (!p) {
      return res.status(404).json({ error: "Product not found" });
    }

    // 3) Insert into inventories
    const [invResult] = await db.query(
      `INSERT INTO inventories 
        (sourceType, productId, productName, quantity, unit, location, status, uid)
       VALUES 
        ('product', ?, ?, ?, ?, 'Main Warehouse', 'received', ?)`,
      [p.productId, p.productName, p.quantity, p.unit, p.uid]
    );

    const inventoryId = invResult.insertId;

    // 4) Create initial tracking entry
    await db.query(
      `INSERT INTO trackinghistory 
        (uid, inventoryId, sourceType, productName, status, createdAt)
       VALUES (?, ?, 'product', ?, 'Created', NOW())`,
      [p.uid, inventoryId, p.productName]
    );

    res.json({ message: "Product approved, added to inventory & tracking created" });
  } catch (e) {
    console.error("ERROR approve-product:", e);
    res.status(500).json({ error: e.message });
  }
});

/* -----------------------------
   APPROVE DONATION → INVENTORY + TRACKING
----------------------------- */
router.put("/approve-donation/:id", async (req, res) => {
  try {
    const donationId = req.params.id;

    // 1) Approve donation
    await db.query(
      "UPDATE donations SET status='approved' WHERE donationId=?",
      [donationId]
    );

    // 2) Fetch donation (amount, method, uid, etc.)
    const [rows] = await db.query(
      "SELECT * FROM donations WHERE donationId=?",
      [donationId]
    );
    const d = rows[0];
    if (!d) {
      return res.status(404).json({ error: "Donation not found" });
    }

    // 3) Insert into inventories (money entry)
    const [invResult] = await db.query(
      `INSERT INTO inventories 
        (productId, productName, location, quantity, unit, status,
         donationId, disasterRequestId, sourceType, amount, method,
         disasterName, requestedItem, uid)
       VALUES 
        (NULL, NULL, 'Main Warehouse', NULL, NULL, 'received',
         ?, NULL, 'donation', ?, ?, NULL, NULL, ?)`,
      [d.donationId, d.amount, d.method, d.uid]
    );

    const inventoryId = invResult.insertId;

    // 4) Tracking entry for donation
    await db.query(
      `INSERT INTO trackinghistory 
        (uid, inventoryId, sourceType, donationId, status, createdAt)
       VALUES (?, ?, 'donation', ?, 'Created', NOW())`,
      [d.uid, inventoryId, d.donationId]
    );

    res.json({ message: "Donation approved, added to inventory & tracking created" });
  } catch (e) {
    console.error("ERROR approve-donation:", e);
    res.status(500).json({ error: e.message });
  }
});

/* -----------------------------------------
   APPROVE DISASTER REQUEST → INVENTORY + TRACKING
----------------------------------------- */
router.put("/approve-request/:id", async (req, res) => {
  try {
    const requestId = req.params.id;

    // 1) Approve disaster request
    await db.query(
      "UPDATE disaster_requests SET status='approved' WHERE requestId=?",
      [requestId]
    );

    // 2) Fetch request
    const [rows] = await db.query(
      "SELECT * FROM disaster_requests WHERE requestId=?",
      [requestId]
    );
    const r = rows[0];
    if (!r) {
      return res.status(404).json({ error: "Disaster request not found" });
    }

    // 3) Insert into inventories
    const [invResult] = await db.query(
      `INSERT INTO inventories 
        (productId, productName, location, quantity, unit, status,
         donationId, disasterRequestId, sourceType, amount, method,
         disasterName, requestedItem, uid)
       VALUES
        (NULL, NULL, 'Main Warehouse', ?, ?, 'received',
         NULL, ?, 'disaster', NULL, NULL,
         ?, ?, ?)`,
      [r.quantity, r.unit, r.requestId, r.disasterName, r.itemName, r.uid]
    );

    const inventoryId = invResult.insertId;

    // 4) Tracking entry for disaster request
    await db.query(
      `INSERT INTO trackinghistory 
        (uid, inventoryId, sourceType, disasterRequestId, productName, status, createdAt)
       VALUES (?, ?, 'disaster', ?, ?, 'Created', NOW())`,
      [r.uid, inventoryId, r.requestId, r.itemName]
    );

    res.json({ message: "Disaster request approved, added to inventory & tracking created" });
  } catch (e) {
    console.error("ERROR approve-request:", e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
