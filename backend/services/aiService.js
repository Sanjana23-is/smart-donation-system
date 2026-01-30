const fs = require("fs");
const path = require("path");

function analyzeProduct({ imagePaths, category, perishable, expiryDate, productName }) {
  let risk = 0;
  let reasons = [];

  const cat = (category || "").toLowerCase();
  const name = (productName || "").toLowerCase();

  // =========================
  // 1) IMAGE VALIDATION
  // =========================
  if (!imagePaths || imagePaths.length === 0) {
    risk += 40;
    reasons.push("No product images provided");
  } else {
    let lowQualityCount = 0;

    for (const img of imagePaths) {
      if (!fs.existsSync(img)) {
        risk += 40;
        reasons.push("Image file missing");
        break;
      }

      const ext = path.extname(img).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        risk += 25;
        reasons.push("Unsupported image format");
      }

      const size = fs.statSync(img).size;
      if (size < 20 * 1024) lowQualityCount++;
    }

    if (lowQualityCount >= 2) {
      risk += 20;
      reasons.push("Low image quality");
    }
  }

  // =========================
  // 2) CATEGORY-BASED RULES (MATCH DROPDOWN)
  // =========================

  switch (cat) {
    case "food":
      // Food is always sensitive
      if (!expiryDate) {
        risk += 30;
        reasons.push("Missing expiry date for food item");
      } else if (new Date(expiryDate) <= new Date()) {
        risk += 60;
        reasons.push("Expired food item");
      }

      if (!perishable) {
        risk += 15;
        reasons.push("Food not marked as perishable");
      }
      break;

    case "clothing":
      // Clothing needs visual verification
      if (!imagePaths || imagePaths.length < 2) {
        risk += 10;
        reasons.push("Insufficient clothing images");
      }
      break;

    case "medical":
      // Medical items are high risk
      risk += 70;
      reasons.push("Medical items require strict verification");
      break;

    case "electronics":
      // Electronics are moderate risk
      risk += 25;
      reasons.push("Electronics require manual verification");
      break;

    case "books":
    case "toys":
    case "utensils":
      // Low-risk categories
      risk += 5;
      break;

    case "others":
      risk += 20;
      reasons.push("Unclassified category");
      break;

    default:
      risk += 30;
      reasons.push("Invalid or unknown category");
  }

  // =========================
  // 3) NAME-BASED SAFETY CHECK
  // =========================
  if (name.includes("medicine") || name.includes("chemical")) {
    risk += 40;
    reasons.push("Potentially dangerous item");
  }

  // =========================
  // 4) NORMALIZE RISK (0–100)
  // =========================
  if (risk > 100) risk = 100;
  if (risk < 0) risk = 0;

  // =========================
  // 5) FINAL AI DECISION
  // =========================
  let status = "approved";
  if (risk >= 30 && risk < 70) status = "review";
  if (risk >= 70) status = "rejected";

  const confidence = Math.max(10, 100 - risk); // never 0%

  return {
    status,
    confidence,
    reason: reasons.length ? reasons.join(" | ") : "Item appears valid",
    riskScore: risk, // optional (useful for admin panel later)
  };
}

module.exports = { analyzeProduct };
