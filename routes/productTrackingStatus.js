const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { productId, status, location, notes } = req.body;
    const [result] = await pool.query(
      `INSERT INTO productTrackingStatus (productId, status, location, notes) VALUES (?, ?, ?, ?)`,
      [productId, status, location, notes || null]
    );
    res.status(201).json({ trackingStatusId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM productTrackingStatus ORDER BY updatedAt DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM productTrackingStatus WHERE trackingStatusId=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { productId, status, location, notes } = req.body;
    await pool.query(
      `UPDATE productTrackingStatus SET productId=?, status=?, location=?, notes=?, updatedAt=NOW() WHERE trackingStatusId=?`,
      [productId, status, location, notes || null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM productTrackingStatus WHERE trackingStatusId=?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
