// backend/services/aiService.js

const fs = require("fs");
const path = require("path");

/**
 * Rule-based, category-aware AI
 * @param {Object} params
 * @param {string[]} params.imagePaths - array of image paths (1–3)
 * @param {string} params.category - product category
 * @param {boolean} params.perishable
 * @param {string|null} params.expiryDate
 */
function analyzeProduct({ imagePaths, category, perishable, expiryDate }) {
  // -------------------------
  // BASIC VALIDATIONS
  // -------------------------
  if (!imagePaths || imagePaths.length === 0) {
    return {
      status: "rejected",
      confidence: 95,
      reason: "No image provided",
    };
  }

  if (imagePaths.length > 3) {
    imagePaths = imagePaths.slice(0, 3);
  }

  // Check image quality (proxy)
  let lowQualityCount = 0;

  for (const imgPath of imagePaths) {
    if (!fs.existsSync(imgPath)) {
      return {
        status: "rejected",
        confidence: 90,
        reason: "Image file missing",
      };
    }

    const stats = fs.statSync(imgPath);
    const ext = path.extname(imgPath).toLowerCase();

    // Invalid image type
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      return {
        status: "rejected",
        confidence: 95,
        reason: "Unsupported image format",
      };
    }

    // Very small image → likely unclear
    if (stats.size < 20 * 1024) {
      lowQualityCount++;
    }
  }

  const normalizedCategory = category.toLowerCase();

  // -------------------------
  // CATEGORY-SPECIFIC RULES
  // -------------------------

  // 1️⃣ CLOTHING (saree, dress, shirt)
  if (
    normalizedCategory.includes("saree") ||
    normalizedCategory.includes("cloth") ||
    normalizedCategory.includes("dress") ||
    normalizedCategory.includes("shirt")
  ) {
    if (lowQualityCount >= 2) {
      return {
        status: "rejected",
        confidence: 85,
        reason: "Images unclear / possible damage",
      };
    }

    if (imagePaths.length === 1) {
      return {
        status: "review",
        confidence: 65,
        reason: "Only one image provided",
      };
    }

    return {
      status: "approved",
      confidence: 85,
      reason: "Clothing images appear acceptable",
    };
  }

  // 2️⃣ FOOD ITEMS
  if (
    normalizedCategory.includes("food") ||
    normalizedCategory.includes("rice") ||
    normalizedCategory.includes("grain")
  ) {
    if (!perishable) {
      return {
        status: "review",
        confidence: 60,
        reason: "Food item not marked perishable",
      };
    }

    if (!expiryDate) {
      return {
        status: "rejected",
        confidence: 90,
        reason: "Missing expiry date",
      };
    }

    const today = new Date();
    const exp = new Date(expiryDate);

    if (exp <= today) {
      return {
        status: "rejected",
        confidence: 95,
        reason: "Expired food item",
      };
    }

    if (imagePaths.length < 2) {
      return {
        status: "review",
        confidence: 70,
        reason: "Insufficient images for food verification",
      };
    }

    return {
      status: "review",
      confidence: 75,
      reason: "Food item requires manual verification",
    };
  }

  // 3️⃣ BOOKS / UTENSILS / TOYS (LOW RISK)
  if (
    normalizedCategory.includes("book") ||
    normalizedCategory.includes("utensil") ||
    normalizedCategory.includes("toy")
  ) {
    if (lowQualityCount > 0) {
      return {
        status: "review",
        confidence: 70,
        reason: "Image clarity not optimal",
      };
    }

    return {
      status: "approved",
      confidence: 90,
      reason: "Low-risk item with valid images",
    };
  }

  // 4️⃣ DEFAULT CASE (UNKNOWN CATEGORY)
  if (imagePaths.length === 1) {
    return {
      status: "review",
      confidence: 60,
      reason: "Unknown category with limited images",
    };
  }

  return {
    status: "review",
    confidence: 65,
    reason: "Requires admin validation",
  };
}

module.exports = { analyzeProduct };
