const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM productCatalog");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productName, category, description } = req.body;
    const [result] = await db.query(
      "INSERT INTO productCatalog (productName, category, description) VALUES (?, ?, ?)",
      [productName, category, description]
    );
    res.status(201).json({ productId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
