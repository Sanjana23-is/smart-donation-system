const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
const mobilenet = require("@tensorflow-models/mobilenet");

/* ===============================
   LOAD MODEL ONCE (SAFE)
================================ */
let modelPromise = mobilenet.load().catch(() => null);

/* ===============================
   MAP ML LABEL → SYSTEM CATEGORY
================================ */
function mapLabelToCategory(label = "") {
  const l = label.toLowerCase();

  if (l.match(/shirt|jean|cloth|saree|shoe|jacket/)) return "clothing";
  if (l.match(/rice|food|bread|fruit|banana|apple/)) return "food";
  if (l.match(/book|notebook/)) return "books";
  if (l.match(/toy|teddy|doll/)) return "toys";
  if (l.match(/phone|laptop|computer/)) return "electronics";

  return "unknown";
}

/* ===============================
   CLASSIFY IMAGE
================================ */
async function classifyImage(imagePath) {
  try {
    const model = await modelPromise;
    if (!model || !fs.existsSync(imagePath)) return null;

    const buffer = fs.readFileSync(imagePath);
    const tensor = tf.node.decodeImage(buffer).expandDims(0);

    const predictions = await model.classify(tensor);
    tensor.dispose();

    return predictions?.[0] || null;
  } catch {
    return null;
  }
}

/* ===============================
   MAIN AI ANALYSIS
================================ */
async function analyzeProduct({
  imagePaths = [],
  category,
  perishable,
  expiryDate,
  productName,
}) {
  let risk = 0;
  const reasons = [];

  const cat = (category || "").toLowerCase();
  const name = (productName || "").toLowerCase();

  /* ---------- SAFE BASELINES ---------- */
  let mlLabel = "generic object";
  let mlCategory = "unknown";
  let mlProb = 60; // neutral baseline

  /* ---------- ML IMAGE ANALYSIS ---------- */
  if (imagePaths.length && fs.existsSync(imagePaths[0])) {
    const result = await classifyImage(imagePaths[0]);

    if (result) {
      mlLabel = result.className;
      mlProb = Math.round((result.probability || 0.6) * 100);
      mlCategory = mapLabelToCategory(mlLabel);
    } else {
      risk += 20;
      reasons.push("Image unclear for ML");
    }
  } else {
    risk += 30;
    reasons.push("No image provided");
  }

  /* ---------- CATEGORY MISMATCH ---------- */
  if (mlCategory !== "unknown" && cat && mlCategory !== cat) {
    risk += 30;
    reasons.push(`Visual mismatch with selected category`);
  }

  /* ---------- BUSINESS RULES ---------- */
  if (cat === "food") {
    if (!expiryDate) {
      risk += 25;
      reasons.push("Missing expiry date");
    } else if (new Date(expiryDate) <= new Date()) {
      risk += 70;
      reasons.push("Expired food item");
    }

    if (!perishable) {
      risk += 15;
      reasons.push("Food not marked perishable");
    }
  }

  if (cat === "medical") {
    risk += 60;
    reasons.push("Medical items are high risk");
  }

  if (name.match(/chemical|medicine|drug/)) {
    risk += 40;
    reasons.push("Potentially dangerous item");
  }

  /* ---------- NORMALIZE RISK ---------- */
  risk = Math.min(100, Math.max(0, risk));

  /* ---------- AI STATUS (STRICT RULES) ---------- */
  let status = "approved";
  if (risk >= 40 && risk < 70) status = "review";
  if (risk >= 70) status = "rejected";

  /* ---------- CONFIDENCE (NEVER TOO LOW) ---------- */
  let confidence = Math.round(mlProb - risk * 0.5);
  confidence = Math.min(95, Math.max(20, confidence));

  return {
    status,
    confidence,
    reason: reasons.length
      ? reasons.join(" | ")
      : "Item visually acceptable with moderate confidence",
    mlLabel,
    mlCategory,
    mlProbability: mlProb,
    riskScore: risk,
  };
}

module.exports = { analyzeProduct };
