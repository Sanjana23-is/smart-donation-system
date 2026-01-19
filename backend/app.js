// ------------------------------------------
// Import dependencies
// ------------------------------------------
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');
const path = require("path");

// Load environment variables
dotenv.config();

// ------------------------------------------
// MySQL Database Connection (Promise-based)
// ------------------------------------------
const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  })
  .promise();

// Test DB connection
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Connected to MySQL successfully');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

// ------------------------------------------
// Initialize Express App
// ------------------------------------------
const app = express();
app.use(cors());

// ✅ IMPORTANT: use express parsers (NOT body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ------------------------------------------
// USER ROUTES
// ------------------------------------------
const donorsRouter = require('./routes/donors');
const donationsRouter = require('./routes/donations');
const donatedProductsRouter = require('./routes/donatedProducts');
const productCatalogRouter = require('./routes/productCatalog');
const inventoriesRouter = require('./routes/inventories');
const productInventoryTrackingRouter = require('./routes/productInventoryTracking');
const disastersRouter = require('./routes/disasters');
const orphanagesRouter = require('./routes/orphanages');
const disasterRequestsRouter = require('./routes/disasterRequests');
const authRouter = require('./routes/auth');
const redirectsRouter = require('./routes/redirects');
const trackingRoutes = require('./routes/tracking');
const expiryAlertsRouter = require('./routes/expiryAlerts');

// ------------------------------------------
// ADMIN ROUTES
// ------------------------------------------
const adminAuthRouter = require('./routes/adminAuth');
const adminActionsRouter = require('./routes/adminActions');

// ------------------------------------------
// USE ROUTES
// ------------------------------------------
app.use('/api/donors', donorsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/donated-products', donatedProductsRouter);
app.use('/api/product-catalog', productCatalogRouter);
app.use('/api/inventories', inventoriesRouter);
app.use('/api/product-inventory-tracking', productInventoryTrackingRouter);
app.use('/api/disasters', disastersRouter);
app.use('/api/orphanages', orphanagesRouter);
app.use('/api/redirect', redirectsRouter);
app.use('/api/tracking', trackingRoutes);
app.use('/api/disaster-requests', disasterRequestsRouter);
app.use('/api/auth', authRouter);
app.use('/api/expiry-alerts', expiryAlertsRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/admin/actions', adminActionsRouter);

// ------------------------------------------
// DEFAULT ROUTE
// ------------------------------------------
app.get('/', (req, res) => {
  res.send('Donation Management API is running...');
});

// ------------------------------------------
// START SERVER
// ------------------------------------------
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});

module.exports = db;
