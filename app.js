const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

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

const app = express();
app.use(bodyParser.json());

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
