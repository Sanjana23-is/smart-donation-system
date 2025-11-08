const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create donation
router.post('/', async (req, res) => {
  try {
    const { donorId, donationType, amount } = req.body;
    const [result] = await pool.query(
      `INSERT INTO donations (donorId, donationType, amount) VALUES (?, ?, ?)`,
      [donorId || null, donationType, amount || null]
    );
    res.status(201).json({ donationId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all donations
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM donations ORDER BY donatedAt DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donation by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM donations WHERE donationId = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update donation
router.put('/:id', async (req, res) => {
  try {
    const { donorId, donationType, amount } = req.body;
    await pool.query(
      `UPDATE donations SET donorId = ?, donationType = ?, amount = ? WHERE donationId = ?`,
      [donorId || null, donationType, amount || null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete donation
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM donations WHERE donationId = ?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
