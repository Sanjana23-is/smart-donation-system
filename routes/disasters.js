const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { disasterType, location, startDate, endDate, status } = req.body;
    const [result] = await pool.query(
      `INSERT INTO disasters (disasterType, location, startDate, endDate, status) VALUES (?, ?, ?, ?, ?)`,
      [disasterType, location, startDate || null, endDate || null, status || null]
    );
    res.status(201).json({ disasterId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM disasters ORDER BY startDate DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM disasters WHERE disasterId=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { disasterType, location, startDate, endDate, status } = req.body;
    await pool.query(
      `UPDATE disasters SET disasterType=?, location=?, startDate=?, endDate=?, status=? WHERE disasterId=?`,
      [disasterType, location, startDate || null, endDate || null, status || null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM disasters WHERE disasterId=?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
