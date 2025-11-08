const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { name, location, contactPerson } = req.body;
    const [result] = await pool.query(`INSERT INTO orphanages (name, location, contactPerson) VALUES (?, ?, ?)`, [name, location, contactPerson]);
    res.status(201).json({ orphanageId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM orphanages`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM orphanages WHERE orphanageId=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, location, contactPerson } = req.body;
    await pool.query(`UPDATE orphanages SET name=?, location=?, contactPerson=? WHERE orphanageId=?`, [name, location, contactPerson, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM orphanages WHERE orphanageId=?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
