-- Full schema for Donation & Disaster Management

CREATE DATABASE IF NOT EXISTS donation_db;
USE donation_db;

-- donors
CREATE TABLE IF NOT EXISTS donors (
  donorId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phoneNumber VARCHAR(100),
  address TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- productCatalog
CREATE TABLE IF NOT EXISTS productCatalog (
  catalogId INT AUTO_INCREMENT PRIMARY KEY,
  barcode VARCHAR(255),
  productName VARCHAR(255),
  brand VARCHAR(255),
  quantity INT DEFAULT 0,
  categories VARCHAR(255),
  defaultExpiryDays INT,
  lastFetchedAt DATETIME
);

-- donations
CREATE TABLE IF NOT EXISTS donations (
  donationId INT AUTO_INCREMENT PRIMARY KEY,
  donorId INT,
  donationType VARCHAR(100),
  amount DECIMAL(12,2),
  donatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donorId) REFERENCES donors(donorId) ON DELETE SET NULL
);

-- donatedProducts
CREATE TABLE IF NOT EXISTS donatedProducts (
  productId INT AUTO_INCREMENT PRIMARY KEY,
  donationId INT,
  productName VARCHAR(255),
  barcode VARCHAR(255),
  catalogId INT,
  expiryDate DATE,
  quantity INT,
  unit VARCHAR(50),
  itemType VARCHAR(100),
  donatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donationId) REFERENCES donations(donationId) ON DELETE CASCADE,
  FOREIGN KEY (catalogId) REFERENCES productCatalog(catalogId) ON DELETE SET NULL
);

-- inventories
CREATE TABLE IF NOT EXISTS inventories (
  inventoryId INT AUTO_INCREMENT PRIMARY KEY,
  location VARCHAR(255),
  contactPerson VARCHAR(255)
);

-- productInventoryTracking
CREATE TABLE IF NOT EXISTS productInventoryTracking (
  trackingId INT AUTO_INCREMENT PRIMARY KEY,
  productId INT,
  inventoryId INT,
  receivedAt DATETIME,
  dispatchedAt DATETIME,
  dispatchedTo VARCHAR(255),
  FOREIGN KEY (productId) REFERENCES donatedProducts(productId) ON DELETE CASCADE,
  FOREIGN KEY (inventoryId) REFERENCES inventories(inventoryId) ON DELETE SET NULL
);

-- productTrackingStatus
CREATE TABLE IF NOT EXISTS productTrackingStatus (
  trackingStatusId INT AUTO_INCREMENT PRIMARY KEY,
  productId INT,
  status VARCHAR(255),
  location VARCHAR(255),
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (productId) REFERENCES donatedProducts(productId) ON DELETE CASCADE
);

-- disasters
CREATE TABLE IF NOT EXISTS disasters (
  disasterId INT AUTO_INCREMENT PRIMARY KEY,
  disasterType VARCHAR(255),
  location VARCHAR(255),
  startDate DATE,
  endDate DATE,
  status VARCHAR(100)
);

-- orphanages
CREATE TABLE IF NOT EXISTS orphanages (
  orphanageId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  location VARCHAR(255),
  contactPerson VARCHAR(255)
);

-- disasterRequests
CREATE TABLE IF NOT EXISTS disasterRequests (
  requestId INT AUTO_INCREMENT PRIMARY KEY,
  disasterId INT,
  requestedItem VARCHAR(255),
  quantity INT,
  unit VARCHAR(50),
  fulfilled BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (disasterId) REFERENCES disasters(disasterId) ON DELETE CASCADE
);

-- redirectedProducts
CREATE TABLE IF NOT EXISTS redirectedProducts (
  redirectId INT AUTO_INCREMENT PRIMARY KEY,
  productId INT,
  orphanageId INT,
  redirectedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES donatedProducts(productId) ON DELETE CASCADE,
  FOREIGN KEY (orphanageId) REFERENCES orphanages(orphanageId) ON DELETE SET NULL
);

CREATE INDEX idx_donorId ON donations(donorId);
CREATE INDEX idx_donationId ON donatedProducts(donationId);
