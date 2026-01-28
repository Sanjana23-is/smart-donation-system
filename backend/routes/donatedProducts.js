const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const fs = require("fs");
const { analyzeProduct } = require("../services/aiService");
const parseImages = require("../utils/imageParser");

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ✅ GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM donatedProducts ORDER BY donatedAt DESC"
    );

    const result = rows.map((r) => ({
      ...r,
      item_image: parseImages(r.item_image),
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ FETCH PRODUCTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD PRODUCT + AI ANALYSIS
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

    const images = req.files ? req.files.map((f) => f.path) : [];
    const uid = "PROD-" + Date.now();

    // ✅ AI ANALYSIS
    const aiResult = analyzeProduct({
      imagePaths: images,
      category,
      perishable: perishable === "true",
      expiryDate,
    });

    await db.query(
      `INSERT INTO donatedProducts
      (donorId, productName, category, quantity, unit, perishable,
       manufactureDate, expiryDate, item_image, uid,
       status, ai_status, ai_confidence, ai_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        donorId || null,
        productName,
        category,
        quantity,
        unit,
        perishable === "true" ? 1 : 0,
        manufactureDate || null,
        expiryDate || null,
        JSON.stringify(images),
        uid,
        "pending",
        aiResult.status,
        aiResult.confidence,
        aiResult.reason,
      ]
    );

    res.json({
      message: "Product submitted successfully",
      uid,
      aiResult,
    });
  } catch (err) {
    console.error("❌ ADD PRODUCT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
