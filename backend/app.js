// ------------------------------------------
// Import dependencies
// ------------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');

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
app.use(bodyParser.json());
app.use(cors());

// ------------------------------------------
// USER ROUTES
// ------------------------------------------
const donorsRouter = require('./routes/donors');
const donationsRouter = require('./routes/donations');
const donatedProductsRouter = require('./routes/donatedProducts');
const productCatalogRouter = require('./routes/productCatalog');
const inventoriesRouter = require('./routes/inventories');
const productInventoryTrackingRouter = require('./routes/productInventoryTracking');
// const productTrackingStatusRouter = require('./routes/productTrackingStatus');
const disastersRouter = require('./routes/disasters');
const orphanagesRouter = require('./routes/orphanages');
const disasterRequestsRouter = require('./routes/disasterRequests');
const authRouter = require('./routes/auth');
const redirectsRouter = require('./routes/redirects');
const trackingRoutes = require('./routes/tracking');

// 🔔 NEW: expiry alerts route
const expiryAlertsRouter = require('./routes/expiryAlerts');

// ------------------------------------------
// ADMIN ROUTES
// ------------------------------------------
const adminAuthRouter = require('./routes/adminAuth');
const adminActionsRouter = require('./routes/adminActions');

// ------------------------------------------
// USE ROUTES
// ------------------------------------------

// User routes
app.use('/api/donors', donorsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/donated-products', donatedProductsRouter);
app.use('/api/product-catalog', productCatalogRouter);
app.use('/api/inventories', inventoriesRouter);
app.use('/api/product-inventory-tracking', productInventoryTrackingRouter);
// app.use('/api/product-tracking-status', productTrackingStatusRouter);
app.use('/api/disasters', disastersRouter);
app.use('/api/orphanages', orphanagesRouter);
app.use('/api/redirect', redirectsRouter);
app.use('/api/tracking', trackingRoutes);

// Disaster requests
app.use('/api/disaster-requests', disasterRequestsRouter);

// Auth
app.use('/api/auth', authRouter);

// 🔔 NEW: expiry alerts (items expiring in next 30 days)
app.use('/api/expiry-alerts', expiryAlertsRouter);

// Admin routes
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

// Export DB pool
module.exports = db;
