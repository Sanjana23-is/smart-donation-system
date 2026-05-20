const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET || "donation_secret_key";

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const [existing] = await db.query(
      "SELECT userId, is_verified FROM users WHERE email = ?",
      [email]
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    if (existing.length > 0) {
      if (existing[0].is_verified) {
        return res.status(400).json({ error: "User already exists and is verified" });
      } else {
        await db.query(
          "UPDATE users SET name = ?, password = ?, otp = ?, otp_expiry = ? WHERE email = ?",
          [name, hashedPassword, otp, otpExpiry, email]
        );
      }
    } else {
      await db.query(
        "INSERT INTO users (name, email, password, otp, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, false)",
        [name, email, hashedPassword, otp, otpExpiry]
      );
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Smart Donation System - Registration OTP",
      text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent successfully", email });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    if (user.is_verified) return res.status(400).json({ error: "User already verified" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > new Date(user.otp_expiry)) return res.status(400).json({ error: "OTP expired" });

    await db.query("UPDATE users SET is_verified = true, otp = NULL, otp_expiry = NULL WHERE email = ?", [email]);
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = rows[0];

    if (!user.is_verified)
      return res.status(400).json({ error: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: "user",
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;


