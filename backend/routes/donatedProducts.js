// backend/routes/donatedProducts.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Generate UID function (used on product add)
function generateUID() {
  return "PROD-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

// Add a donated product (user)
// Add a donated product (user)
router.post("/", async (req, res) => {
  try {
    const {
      donorId,
      productName,
      category,
      quantity,
      unit,
      perishable,        // NEW
      manufactureDate,   // NEW
      expiryDate         // NEW
    } = req.body;

    if (!donorId || !productName || !category || !quantity || !unit) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // perishable flag -> 0 or 1
    const isPerishable = perishable ? 1 : 0;

    // If perishable, manufacture + expiry are mandatory
    if (isPerishable && (!manufactureDate || !expiryDate)) {
      return res
        .status(400)
        .json({ error: "Manufacture and expiry date required for perishable products." });
    }

    const uid = generateUID();
    const barcode = uid;

    const [result] = await db.query(
      `INSERT INTO donatedProducts 
       (donorId, productName, category, quantity, unit, status, uid, barcode,
        perishable, manufactureDate, expiryDate)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        donorId,
        productName,
        category,
        quantity,
        unit,
        uid,
        barcode,
        isPerishable,
        isPerishable ? manufactureDate : null,
        isPerishable ? expiryDate : null,
      ]
    );

    res.status(201).json({
      message: "Product added successfully",
      productId: result.insertId,
      uid,
      barcode,
    });
  } catch (err) {
    console.error("❌ ERROR ADDING DONATED PRODUCT:", err);
    res.status(500).json({ error: err.message });
  }
});


// List donated products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM donatedProducts ORDER BY productId DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Approve donated product -> update expiryDate + insert into inventories
// ✅ Approve donated product -> insert into inventories with perishable + dates
router.put("/:id/approve", async (req, res) => {
  try {
    const pid = req.params.id;

    // 1) Mark as approved (we already have manufacture/expiry from donor)
    await db.query(
      "UPDATE donatedProducts SET status='approved' WHERE productId=?",
      [pid]
    );

    // 2) Fetch product
    const [rows] = await db.query(
      "SELECT * FROM donatedProducts WHERE productId=?",
      [pid]
    );
    const p = rows[0];
    if (!p) return res.status(404).json({ error: "Product not found" });

    // 3) Insert into inventories, carry expiry/perishable forward
    await db.query(
      `INSERT INTO inventories
       (sourceType, productId, productName, quantity, unit, uid, location, status,
        perishable, manufactureDate, expiryDate)
       VALUES ('product', ?, ?, ?, ?, ?, 'Main Warehouse', 'received',
               ?, ?, ?)`,
      [
        p.productId,
        p.productName,
        p.quantity,
        p.unit,
        p.uid,
        p.perishable || 0,
        p.manufactureDate || null,
        p.expiryDate || null,
      ]
    );

    res.json({ message: "Product approved & added to inventory" });
  } catch (err) {
    console.error("❌ ERROR APPROVING DONATED PRODUCT:", err);
    res.status(500).json({ error: err.message });
  }
});

// Reject product
router.put("/:id/reject", async (req, res) => {
  try {
    await db.query(
      "UPDATE donatedProducts SET status='rejected' WHERE productId=?",
      [req.params.id]
    );
    res.json({ message: "Product rejected" });
  } catch (err) {
    console.error("❌ ERROR REJECTING DONATED PRODUCT:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
