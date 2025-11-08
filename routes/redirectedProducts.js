const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { productId, orphanageId, redirectedAt } = req.body;
    const [result] = await pool.query(
      `INSERT INTO redirectedProducts (productId, orphanageId, redirectedAt) VALUES (?, ?, ?)`,
      [productId, orphanageId || null, redirectedAt || null]
    );
    res.status(201).json({ redirectId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM redirectedProducts ORDER BY redirectedAt DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM redirectedProducts WHERE redirectId=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM redirectedProducts WHERE redirectId=?`, [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
