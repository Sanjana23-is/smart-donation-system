const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyUserToken } = require("../middlewares/authMiddleware");

// -------------------------------------------
// USER REGISTER
// POST /user/register
// -------------------------------------------
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password required" });
  }

  try {
    // Check if email already exists
    const [exists] = await db.query(
      "SELECT userId FROM users WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------------------
// USER LOGIN
// POST /user/login
// -------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    // Find user
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------------------
// USER PROFILE (Protected)
// GET /user/profile
// Header: Authorization: Bearer <token>
// -------------------------------------------
router.get("/profile", verifyUserToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      "SELECT userId, name, email FROM users WHERE userId = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("Profile Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
