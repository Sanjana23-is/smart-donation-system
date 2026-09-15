//backend/routes/donatedProducts.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const path = require("path");
const { analyzeProduct } = require("../services/aiService");
const parseImages = require("../utils/imageParser");
const userAuth = require("../middleware/userAuth");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/upload");

/* ===============================
   GET USER PRODUCTS (OWNED ONLY)
================================ */
router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await db.query(
      `SELECT DISTINCT
         dp.productId,
         dp.productName,
         dp.category,
         dp.quantity,
         dp.unit,
         dp.uid,
         dp.status,
         dp.donatedAt,
         dp.perishable,
         dp.manufactureDate,
         dp.expiryDate,
         dp.item_image
       FROM donatedProducts dp
       LEFT JOIN donors d ON dp.donorId = d.donorId
       WHERE dp.userId = ? OR d.userId = ?
       ORDER BY dp.donatedAt DESC`,
      [userId, userId]
    );

    res.json(
      rows.map((r) => ({
        ...r,
        item_image: parseImages(r.item_image),
      }))
    );
  } catch (err) {
    console.error("❌ FETCH PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* ===============================
   GET ALL PRODUCTS (ADMIN ONLY)
================================ */
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM donatedProducts ORDER BY donatedAt DESC"
    );

    res.json(
      rows.map((r) => ({
        ...r,
        item_image: parseImages(r.item_image),
      }))
    );
  } catch (err) {
    console.error("❌ ADMIN FETCH PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch all products" });
  }
});

/* ===============================
   ADD PRODUCT + AI ANALYSIS
================================ */
router.post("/", userAuth, upload.array("item_images", 3), async (req, res) => {
  try {
    const {
      donorId,
      productName,
      category,
      quantity,
      unit,
      perishable,
      manufactureDate,
      expiryDate,
    } = req.body;

    if (!productName || !category || !quantity || !unit) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one product image is required" });
    }

    const userId = req.user.userId;

    // Verify donor ownership if donorId is supplied
    let verifiedDonorId = null;
    if (donorId !== undefined && donorId !== null && donorId !== "") {
      const parsedDonorId = parseInt(donorId, 10);
      if (isNaN(parsedDonorId)) {
        return res.status(400).json({ error: "Invalid donorId" });
      }

      const [[donor]] = await db.query(
        "SELECT donorId FROM donors WHERE donorId = ? AND userId = ?",
        [parsedDonorId, userId]
      );

      if (!donor) {
        return res.status(403).json({ error: "Access denied. You do not own this donor profile." });
      }

      verifiedDonorId = parsedDonorId;
    }

    const isPerishable =
      perishable === "true" || perishable === true || perishable === "1";

    const images = req.files ? req.files.map((f) => f.path) : [];
    const uid = "PROD-" + Date.now();

    // ✅ AI ANALYSIS (AWAITED)
    const aiResult = await analyzeProduct({
      imagePaths: images,
      category,
      productName,
      perishable: isPerishable,
      expiryDate,
    });

    const aiStatus = aiResult?.status || "review";
    const aiConfidence = Number.isFinite(aiResult?.confidence)
      ? aiResult.confidence
      : 50;

    const aiReason = aiResult?.reason || "AI analysis completed";

    await db.query(
      `INSERT INTO donatedProducts
      (donorId, userId, productName, category, quantity, unit, perishable,
       manufactureDate, expiryDate, item_image, uid,
       status, ai_status, ai_confidence, ai_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        verifiedDonorId,
        userId,
        productName,
        category.toLowerCase(),
        quantity,
        unit,
        isPerishable ? 1 : 0,
        manufactureDate || null,
        expiryDate || null,
        JSON.stringify(
          (req.files || []).map((f) => "uploads/" + path.basename(f.path))
        ),
        uid,
        "pending",
        aiStatus,
        aiConfidence,
        aiReason,
      ]
    );

    res.json({
      message: "Product submitted with AI analysis",
      uid,
      aiResult,
    });
  } catch (err) {
    console.error("❌ ADD PRODUCT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;