const express = require("express");
const router = express.Router();
const db = require("../db");

// Middleware to verify JWT token (already exists in other routes, we'll inline a simple one or just assume auth happens if we had a global one. Since there's no global auth middleware exported in auth.js, let's write a quick one here or just trust the userId sent by frontend for now, since it's a mock/demo app. Actually, I should use the token.)
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// GET /api/user/profile
router.get("/profile", authenticate, async (req, res) => {
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
router.put("/profile", authenticate, async (req, res) => {
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
