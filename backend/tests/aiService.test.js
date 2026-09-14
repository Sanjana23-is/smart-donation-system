/**
 * tests/aiService.test.js
 *
 * Unit tests for the AI risk-scoring engine in services/aiService.js.
 * TensorFlow and MobileNet are fully mocked — no GPU or model download needed.
 */

// ─── Mock TensorFlow BEFORE importing aiService ──────────────────────────────
jest.mock("@tensorflow/tfjs-node", () => ({
  node: {
    decodeImage: jest.fn().mockReturnValue({
      expandDims: jest.fn().mockReturnValue({
        dispose: jest.fn(),
      }),
    }),
  },
}));

// Default MobileNet mock — returns a "jersey, T-shirt" classification (clothing)
jest.mock("@tensorflow-models/mobilenet", () => ({
  load: jest.fn().mockResolvedValue({
    classify: jest.fn().mockResolvedValue([
      { className: "jersey, T-shirt, polo shirt", probability: 0.9 },
    ]),
  }),
}));

// ─── Mock fs so we can control whether "image exists" ────────────────────────
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(Buffer.from("fake-image-data")),
}));

const { analyzeProduct } = require("../services/aiService");

// ─────────────────────────────────────────────────────────────────────────────

describe("AI Service - analyzeProduct()", () => {

  // ── Test 1: No image provided ──────────────────────────────────────────────
  test("no image → adds risk for missing image", async () => {
    const result = await analyzeProduct({
      imagePaths: [],
      category: "clothing",
      productName: "shirt",
      perishable: false,
      expiryDate: null,
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(30);
    expect(result.reason).toMatch(/No image/i);
  });

  // ── Test 2: Expired food ───────────────────────────────────────────────────
  test("expired food → status is rejected and riskScore >= 70", async () => {
    const result = await analyzeProduct({
      imagePaths: ["fake/path/image.jpg"],
      category: "food",
      productName: "rice",
      perishable: true,
      expiryDate: "2020-01-01", // clearly expired
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(70);
    expect(result.status).toBe("rejected");
    expect(result.reason).toMatch(/Expired/i);
  });

  // ── Test 3: Food with no expiry date ──────────────────────────────────────
  test("food with no expiry date → riskScore >= 25", async () => {
    const result = await analyzeProduct({
      imagePaths: ["fake/path/image.jpg"],
      category: "food",
      productName: "rice",
      perishable: true,
      expiryDate: null, // missing
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(25);
    expect(result.reason).toMatch(/expiry/i);
  });

  // ── Test 4: Medical item ───────────────────────────────────────────────────
  test("medical item → riskScore >= 60", async () => {
    const result = await analyzeProduct({
      imagePaths: ["fake/path/image.jpg"],
      category: "medical",
      productName: "bandages",
      perishable: false,
      expiryDate: null,
    });

    expect(result.riskScore).toBeGreaterThanOrEqual(60);
    expect(result.reason).toMatch(/Medical/i);
  });

  // ── Test 5: Category mismatch (ML says clothing, user says food) ──────────
  test("category mismatch → adds risk and includes mismatch reason", async () => {
    // MobileNet mock returns "jersey" (→ clothing) but user says "food"
    const result = await analyzeProduct({
      imagePaths: ["fake/path/image.jpg"],
      category: "food",
      productName: "something",
      perishable: false,
      expiryDate: null,
    });

    // Mismatch penalty is +30 risk
    expect(result.riskScore).toBeGreaterThanOrEqual(30);
    expect(result.reason).toMatch(/mismatch/i);
  });

  // ── Test 6: Clean clothing item → approved ─────────────────────────────────
  test("clean clothing item → status is approved and riskScore < 40", async () => {
    const result = await analyzeProduct({
      imagePaths: ["fake/path/image.jpg"],
      category: "clothing",
      productName: "shirt",
      perishable: false,
      expiryDate: null,
    });

    // ML says jersey (clothing) + user says clothing = no mismatch
    // No food/medical rules triggered
    expect(result.riskScore).toBeLessThan(40);
    expect(result.status).toBe("approved");
  });

});
