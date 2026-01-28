const fs = require("fs");
const path = require("path");

function analyzeProduct({ imagePaths, category, perishable, expiryDate }) {
  if (!imagePaths || imagePaths.length === 0) {
    return { status: "rejected", confidence: 95, reason: "No image provided" };
  }

  let lowQuality = 0;

  for (const img of imagePaths) {
    if (!fs.existsSync(img)) {
      return { status: "rejected", confidence: 90, reason: "Image file missing" };
    }

    const ext = path.extname(img).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      return { status: "rejected", confidence: 95, reason: "Unsupported image format" };
    }

    const size = fs.statSync(img).size;
    if (size < 20 * 1024) lowQuality++;
  }

  const cat = category.toLowerCase();

  // FOOD RULES
  if (cat.includes("food") || cat.includes("rice") || cat.includes("grain")) {
    if (!perishable) {
      return { status: "review", confidence: 60, reason: "Food not marked perishable" };
    }

    if (!expiryDate) {
      return { status: "rejected", confidence: 90, reason: "Missing expiry date" };
    }

    if (new Date(expiryDate) <= new Date()) {
      return { status: "rejected", confidence: 95, reason: "Expired food item" };
    }

    return { status: "review", confidence: 75, reason: "Food requires manual verification" };
  }

  // CLOTHING RULES
  if (cat.includes("cloth") || cat.includes("dress") || cat.includes("shirt")) {
    if (lowQuality >= 2) {
      return { status: "rejected", confidence: 85, reason: "Poor image quality" };
    }
    return { status: "approved", confidence: 85, reason: "Clothing looks acceptable" };
  }

  // LOW RISK ITEMS
  if (cat.includes("book") || cat.includes("toy") || cat.includes("utensil")) {
    return { status: "approved", confidence: 90, reason: "Low-risk item" };
  }

  return { status: "review", confidence: 65, reason: "Unknown category" };
}

module.exports = { analyzeProduct };
