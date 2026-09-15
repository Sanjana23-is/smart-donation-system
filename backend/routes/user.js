const express = require("express");
const router = express.Router();
const db = require("../db");

const userAuth = require("../middleware/userAuth");

// GET /api/user/profile
router.get("/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching profile for userId:", userId);
    
    const [users] = await db.query(
      "SELECT userId, name, email, phone, address, is_verified, donations_anonymous, notifications_enabled FROM users WHERE userId = ?",
      [userId]
    );

    if (users.length === 0) {
      console.log("User not found in DB for ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Found user:", users[0].email);

    // Fetch total donations stats belonging to the authenticated user's donors
    const [donations] = await db.query(
      `SELECT COUNT(*) AS count, IFNULL(SUM(dn.amount), 0) AS total_money
       FROM donations dn
       INNER JOIN donors d ON dn.donorId = d.donorId
       WHERE d.userId = ? AND dn.status = 'approved'`,
      [userId]
    );

    console.log("Donations stats:", donations[0]);

    // Fetch total product items belonging to the authenticated user (direct or legacy via owned donor)
    const [products] = await db.query(
      `SELECT IFNULL(SUM(dp.quantity), 0) AS total_items
       FROM donatedProducts dp
       WHERE dp.status = 'approved'
         AND (
           dp.userId = ?
           OR dp.donorId IN (SELECT donorId FROM donors WHERE userId = ?)
         )`,
      [userId, userId]
    );

    console.log("Products stats:", products[0]);

    res.json({
      user: users[0],
      stats: {
        monetaryCount: Number(donations[0].count) || 0,
        totalMoney: Number(donations[0].total_money) || 0,
        totalItems: Number(products[0].total_items) || 0
      }
    });

  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// PUT /api/user/profile
router.put("/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, address, donations_anonymous, notifications_enabled } = req.body;

    await db.query(
      "UPDATE users SET phone = ?, address = ?, donations_anonymous = ?, notifications_enabled = ? WHERE userId = ?",
      [phone, address, donations_anonymous, notifications_enabled, userId]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
