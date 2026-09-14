//backend/routes/donatedaProducts.js
const express = require("express");
const router = express.Router(); // ✅ REQUIRED
const db = require("../db");
const path = require("path");
const { analyzeProduct } = require("../services/aiService");
const parseImages = require("../utils/imageParser");
const userAuth = require("../middleware/userAuth");
const upload = require("../middleware/upload");

/* ===============================
   GET PRODUCTS
================================ */
router.get("/", async (req, res) => {
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
    console.error("❌ FETCH PRODUCTS ERROR:", err);
    res.status(500).json({ error: err.message });
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

    // AUTHENTICATED USER ID
    // We expect userAuth middleware to be used here. 
    // If not, we will need to add it to the route definition.
    // For now, let's assume if req.user exists we use it.
    // However, the original code used `donorId` from body.
    // We MUST prioritize req.user.userId if available.

    const userId = req.user ? req.user.userId : null;

    await db.query(
      `INSERT INTO donatedProducts
      (donorId, userId, productName, category, quantity, unit, perishable,
       manufactureDate, expiryDate, item_image, uid,
       status, ai_status, ai_confidence, ai_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        donorId || null,
        userId, // ✅ STORING AUTHENTICATED USER ID
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