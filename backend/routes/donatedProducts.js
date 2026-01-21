const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../middleware/upload");
const { analyzeProduct } = require("../services/aiService");

// UID generator
function generateUID() {
  return "PROD-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

/**
 * ADD DONATED PRODUCT
 * - Accepts up to 3 images
 * - AI gives suggestion only
 * - Admin approval is final
 */
router.post(
  "/",
  upload.array("item_images", 3), // 🔴 MUST MATCH POSTMAN KEY
  async (req, res) => {
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

      // ---------------- VALIDATIONS ----------------
      if (!donorId || !productName || !category || !quantity || !unit) {
        return res.status(400).json({
          error: "Required fields missing",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "At least one image is required",
        });
      }

      if (req.files.length > 3) {
        return res.status(400).json({
          error: "Maximum 3 images allowed",
        });
      }

      const isPerishable = Number(perishable) === 1;

      if (isPerishable && !expiryDate) {
        return res.status(400).json({
          error: "Expiry date is required for perishable items",
        });
      }

      // ---------------- IMAGE PATHS ----------------
      const imagePaths = req.files.map((file) => file.path);

      // ---------------- AI ANALYSIS ----------------
      const aiResult = analyzeProduct({
        imagePaths,
        category,
        perishable: isPerishable,
        expiryDate: expiryDate || null,
      });
      // aiResult = { status: "approved/rejected/review", confidence: 0-100, reason }

      const uid = generateUID();
      const barcode = uid;

      // ---------------- DB INSERT ----------------
      const [result] = await db.query(
        `
        INSERT INTO donatedProducts (
          donorId,
          productName,
          category,
          quantity,
          unit,
          status,
          uid,
          barcode,
          perishable,
          manufactureDate,
          expiryDate,
          item_image,
          ai_status,
          ai_confidence
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          donorId,
          productName,
          category,
          quantity,
          unit,
          "pending",                 // 🔒 ADMIN DECIDES
          uid,
          barcode,
          isPerishable,
          manufactureDate || null,
          expiryDate || null,
          imagePaths.join(","),      // multiple images stored
          aiResult.status,            // AI suggestion
          aiResult.confidence,        // AI confidence
        ]
      );

      // ---------------- RESPONSE ----------------
      return res.status(201).json({
        message: "Product submitted successfully",
        productId: result.insertId,
        ai: aiResult,
        finalStatus: "pending (admin review required)",
      });

    } catch (err) {
      console.error("❌ ERROR ADDING DONATED PRODUCT:", err);
      return res.status(500).json({
        error: "Internal server error",
        details: err.message,
      });
    }
  }
);

module.exports = router;
