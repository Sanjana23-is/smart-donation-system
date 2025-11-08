const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create catalog item
router.post('/', async (req, res) => {
  try {
    const { barcode, productName, brand, quantity, categories, defaultExpiryDays } = req.body;
    const [result] = await pool.query(
      `INSERT INTO productCatalog (barcode, productName, brand, quantity, categories, defaultExpiryDays, lastFetchedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [barcode, productName, brand, quantity || 0, categories || null, defaultExpiryDays || null, null]
    );
    res.status(201).json({ catalogId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read catalog
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM productCatalog ORDER BY productName`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// single
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM productCatalog WHERE catalogId = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update
router.put('/:id', async (req, res) => {
  try {
    const { barcode, productName, brand, quantity, categories, defaultExpiryDays } = req.body;
    await pool.query(
      `UPDATE productCatalog SET barcode=?, productName=?, brand=?, quantity=?, categories=?, defaultExpiryDays=? WHERE catalogId=?`,
      [barcode, productName, brand, quantity || 0, categories || null, defaultExpiryDays || null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM productCatalog WHERE catalogId = ?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
