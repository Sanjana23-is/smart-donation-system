const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { productId, inventoryId, receivedAt, dispatchedAt, dispatchedTo } = req.body;
    const [result] = await pool.query(
      `INSERT INTO productInventoryTracking (productId, inventoryId, receivedAt, dispatchedAt, dispatchedTo) VALUES (?, ?, ?, ?, ?)`,
      [productId, inventoryId || null, receivedAt || null, dispatchedAt || null, dispatchedTo || null]
    );
    res.status(201).json({ trackingId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM productInventoryTracking ORDER BY trackingId DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM productInventoryTracking WHERE trackingId = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { productId, inventoryId, receivedAt, dispatchedAt, dispatchedTo } = req.body;
    await pool.query(
      `UPDATE productInventoryTracking SET productId=?, inventoryId=?, receivedAt=?, dispatchedAt=?, dispatchedTo=? WHERE trackingId=?`,
      [productId, inventoryId || null, receivedAt || null, dispatchedAt || null, dispatchedTo || null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM productInventoryTracking WHERE trackingId=?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
