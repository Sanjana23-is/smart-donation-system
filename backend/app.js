const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/api/donors", require("./routes/donors"));
app.use("/api/donations", require("./routes/donations"));
app.use("/api/donated-products", require("./routes/donatedProducts"));
app.use("/api/admin/actions", require("./routes/adminActions"));
app.use("/api/inventories", require("./routes/inventories"));
app.use("/api/tracking", require("./routes/tracking"));
app.use("/api/redirect", require("./routes/redirects"));
app.use("/api/expiry-alerts", require("./routes/expiryAlerts"));
app.use("/api/disasters", require("./routes/disasters"));
app.use("/api/orphanages", require("./routes/orphanages"));
app.use("/api/dashboard", require("./routes/dashboard"));


// Default route
app.get("/", (req, res) => {
  res.send("Donation Management API running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
