//backend/routes/donatedaProducts.js
const express = require("express");
const router = express.Router(); // ✅ REQUIRED
const db = require("../db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { analyzeProduct } = require("../services/aiService");
const parseImages = require("../utils/imageParser");

/* ===============================
   UPLOAD CONFIG (MULTER)
================================ */
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage }); // ✅ THIS WAS MISSING

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
router.post("/", upload.array("item_images", 3), async (req, res) => {
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
      (donorId, productName, category, quantity, unit, perishable,
       manufactureDate, expiryDate, item_image, uid,
       status, ai_status, ai_confidence, ai_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        donorId || null,
        productName,
        category.toLowerCase(),
        quantity,
        unit,
        isPerishable ? 1 : 0,
        manufactureDate || null,
        expiryDate || null,
        JSON.stringify(
          req.files.map((f) => "uploads/" + path.basename(f.path))
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