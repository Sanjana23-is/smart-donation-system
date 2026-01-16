const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productInventoryTracking");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productId, inventoryId, updatedQuantity } = req.body;
    const [result] = await db.query(
      "INSERT INTO productInventoryTracking (productId, inventoryId, updatedQuantity) VALUES (?, ?, ?)",
      [productId, inventoryId, updatedQuantity]
    );
    res.status(201).json({ trackId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
