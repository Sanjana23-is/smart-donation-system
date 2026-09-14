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

    // Fetch total donations stats
    const [donations] = await db.query(
      "SELECT COUNT(*) as count, SUM(amount) as total_money FROM donations WHERE donorId = ? AND status = 'approved'",
      [userId]
    );

    console.log("Donations stats:", donations[0]);

    const [products] = await db.query(
      "SELECT SUM(quantity) as total_items FROM donatedProducts WHERE donorId = ? AND status = 'approved'",
      [userId]
    );

    console.log("Products stats:", products[0]);

    res.json({
      user: users[0],
      stats: {
        monetaryCount: donations[0].count || 0,
        totalMoney: donations[0].total_money || 0,
        totalItems: products[0].total_items || 0
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
