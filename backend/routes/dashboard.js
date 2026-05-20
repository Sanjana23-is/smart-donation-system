const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    // 1️⃣ Total donors
    const [[donors]] = await db.query(
      "SELECT COUNT(*) AS totalDonors FROM donors"
    );

    // 2️⃣ Total money donated (only approved)
    const [[money]] = await db.query(
      "SELECT SUM(amount) AS totalMoney FROM donations WHERE status = 'approved'"
    );

    // 3️⃣ Total products donated (approved products)
    const [[products]] = await db.query(
      "SELECT COUNT(*) AS totalProducts FROM donatedProducts WHERE status = 'approved'"
    );

    // 4️⃣ Total inventory items (optional but useful)
    const [[inventory]] = await db.query(
      "SELECT COUNT(*) AS totalInventory FROM inventories"
    );

    res.json({
      totalDonors: donors.totalDonors || 0,
      totalMoney: money.totalMoney || 0,
      totalProducts: products.totalProducts || 0,
      totalInventory: inventory.totalInventory || 0,
    });
  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

router.get("/charts", async (req, res) => {
  try {
    // 1️⃣ Donation Trends (Last 7 days, products only for simplicity)
    const [trends] = await db.query(`
      SELECT DATE(donatedAt) as date, COUNT(*) as count 
      FROM donatedProducts 
      WHERE donatedAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(donatedAt)
      ORDER BY date ASC
    `);

    // 2️⃣ AI Rejection Stats
    const [aiStats] = await db.query(`
      SELECT IFNULL(ai_status, 'pending') as name, COUNT(*) as value
      FROM donatedProducts
      GROUP BY name
    `);

    res.json({ trends, aiStats });
  } catch (err) {
    console.error("❌ DASHBOARD CHARTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
