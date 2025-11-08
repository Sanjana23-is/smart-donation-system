const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create donated product
router.post('/', async (req, res) => {
  try {
    const { donationId, productName, barcode, catalogId, expiryDate, quantity, unit, itemType } = req.body;
    const [result] = await pool.query(
      `INSERT INTO donatedProducts (donationId, productName, barcode, catalogId, expiryDate, quantity, unit, itemType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [donationId || null, productName, barcode, catalogId || null, expiryDate || null, quantity || 0, unit || null, itemType || null]
    );
    res.status(201).json({ productId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all donated products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM donatedProducts ORDER BY donatedAt DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM donatedProducts WHERE productId = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { productName, barcode, catalogId, expiryDate, quantity, unit, itemType } = req.body;
    await pool.query(
      `UPDATE donatedProducts SET productName=?, barcode=?, catalogId=?, expiryDate=?, quantity=?, unit=?, itemType=? WHERE productId=?`,
      [productName, barcode, catalogId || null, expiryDate || null, quantity || 0, unit || null, itemType || null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM donatedProducts WHERE productId = ?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
