const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Donor joins their personal room using userId
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined room user_${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible from all routes
app.locals.io = io;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
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
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/user", require("./routes/user"));

// Default route
app.get("/", (req, res) => {
  res.send("Donation Management API running...");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready`);
});
