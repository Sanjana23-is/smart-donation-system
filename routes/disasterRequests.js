const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { disasterId, requestedItem, quantity, unit } = req.body;
    const [result] = await pool.query(
      `INSERT INTO disasterRequests (disasterId, requestedItem, quantity, unit) VALUES (?, ?, ?, ?)`,
      [disasterId || null, requestedItem, quantity || 0, unit || null]
    );
    res.status(201).json({ requestId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM disasterRequests ORDER BY requestId DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM disasterRequests WHERE requestId=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { disasterId, requestedItem, quantity, unit, fulfilled } = req.body;
    await pool.query(
      `UPDATE disasterRequests SET disasterId=?, requestedItem=?, quantity=?, unit=?, fulfilled=? WHERE requestId=?`,
      [disasterId || null, requestedItem, quantity || 0, unit || null, fulfilled ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM disasterRequests WHERE requestId=?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
