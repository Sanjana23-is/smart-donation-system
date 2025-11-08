const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create donor
router.post('/', async (req, res) => {
  try {
    const { name, email, phoneNumber, address } = req.body;
    const [result] = await pool.query(
      `INSERT INTO donors (name, email, phoneNumber, address) VALUES (?, ?, ?, ?)`,
      [name, email, phoneNumber, address]
    );
    res.status(201).json({ donorId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all donors
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM donors ORDER BY createdAt DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read single donor
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM donors WHERE donorId = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update donor
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phoneNumber, address } = req.body;
    await pool.query(
      `UPDATE donors SET name = ?, email = ?, phoneNumber = ?, address = ? WHERE donorId = ?`,
      [name, email, phoneNumber, address, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete donor
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM donors WHERE donorId = ?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
