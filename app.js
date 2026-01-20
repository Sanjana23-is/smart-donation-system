// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');

// Configure environment variables
dotenv.config();

// ✅ MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Try connecting to MySQL
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL successfully');
  }
});

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors()); // ✅ allow requests from frontend

// ✅ Import Routers
const donorsRouter = require('./routes/donors');
const donationsRouter = require('./routes/donations');
const donatedProductsRouter = require('./routes/donatedProducts');
const productCatalogRouter = require('./routes/productCatalog');
const inventoriesRouter = require('./routes/inventories');
const productInventoryTrackingRouter = require('./routes/productInventoryTracking');
const productTrackingStatusRouter = require('./routes/productTrackingStatus');
const disastersRouter = require('./routes/disasters');
const orphanagesRouter = require('./routes/orphanages');
const disasterRequestsRouter = require('./routes/disasterRequests');
const redirectedProductsRouter = require('./routes/redirectedProducts');

// ✅ Use Routers (API endpoints)
app.use('/api/donors', donorsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/donated-products', donatedProductsRouter);
app.use('/api/product-catalog', productCatalogRouter);
app.use('/api/inventories', inventoriesRouter);
app.use('/api/product-inventory-tracking', productInventoryTrackingRouter);
app.use('/api/product-tracking-status', productTrackingStatusRouter);
app.use('/api/disasters', disastersRouter);
app.use('/api/orphanages', orphanagesRouter);
app.use('/api/disaster-requests', disasterRequestsRouter);
app.use('/api/redirected-products', redirectedProductsRouter);

// ✅ Default route (for testing)
app.get('/', (req, res) => {
  res.send('Donation Management API is running...');
});

// ✅ Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});