-- MySQL dump 10.13  Distrib 9.7.1, for macos26.4 (arm64)
--
-- Host: localhost    Database: donation_db
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `adminId` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`adminId`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `disaster_allocations`
--

DROP TABLE IF EXISTS `disaster_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disaster_allocations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint NOT NULL,
  `disaster_request_id` int NOT NULL,
  `allocated_quantity` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_id` (`inventory_id`),
  CONSTRAINT `disaster_allocations_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_assets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `disasterrequests`
--

DROP TABLE IF EXISTS `disasterrequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disasterrequests` (
  `requestId` int NOT NULL AUTO_INCREMENT,
  `disasterId` int DEFAULT NULL,
  `requestedItem` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `fulfilled` tinyint(1) DEFAULT '0',
  `status` varchar(20) DEFAULT 'pending',
  `uid` varchar(50) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`requestId`),
  UNIQUE KEY `uid` (`uid`),
  KEY `disasterId` (`disasterId`),
  CONSTRAINT `disasterrequests_ibfk_1` FOREIGN KEY (`disasterId`) REFERENCES `disasters` (`disasterId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `disasters`
--

DROP TABLE IF EXISTS `disasters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disasters` (
  `disasterId` int NOT NULL AUTO_INCREMENT,
  `disasterType` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  PRIMARY KEY (`disasterId`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `donatedProducts`
--

DROP TABLE IF EXISTS `donatedProducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donatedProducts` (
  `productId` int NOT NULL AUTO_INCREMENT,
  `donorId` int DEFAULT NULL,
  `donationId` int DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `barcode` varchar(255) DEFAULT NULL,
  `catalogId` int DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `itemType` varchar(100) DEFAULT NULL,
  `donatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'pending',
  `uid` varchar(255) DEFAULT NULL,
  `perishable` tinyint(1) NOT NULL DEFAULT '0',
  `manufactureDate` date DEFAULT NULL,
  `item_image` text NOT NULL,
  `ai_status` enum('approved','rejected','review') NOT NULL DEFAULT 'review',
  `ai_confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
  `admin_remark` varchar(255) DEFAULT NULL,
  `ai_reason` varchar(255) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`productId`),
  UNIQUE KEY `uid` (`uid`),
  KEY `catalogId` (`catalogId`),
  KEY `idx_donationId` (`donationId`),
  KEY `fk_donorId` (`donorId`),
  KEY `userId` (`userId`),
  CONSTRAINT `donatedproducts_ibfk_1` FOREIGN KEY (`donationId`) REFERENCES `donations` (`donationId`) ON DELETE CASCADE,
  CONSTRAINT `donatedproducts_ibfk_2` FOREIGN KEY (`catalogId`) REFERENCES `productcatalog` (`catalogId`) ON DELETE SET NULL,
  CONSTRAINT `donatedproducts_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `donationId` int NOT NULL AUTO_INCREMENT,
  `donorId` int DEFAULT NULL,
  `donationDate` date DEFAULT NULL,
  `donationType` varchar(100) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `donatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'pending',
  `uid` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `paymentReference` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`donationId`),
  KEY `idx_donorId` (`donorId`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`donorId`) REFERENCES `donors` (`donorId`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `donors`
--

DROP TABLE IF EXISTS `donors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donors` (
  `donorId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(100) DEFAULT NULL,
  `address` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`donorId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories` (
  `inventoryId` int NOT NULL AUTO_INCREMENT,
  `productId` int DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `donationId` int DEFAULT NULL,
  `disasterRequestId` int DEFAULT NULL,
  `sourceType` varchar(20) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `disasterName` varchar(255) DEFAULT NULL,
  `requestedItem` varchar(255) DEFAULT NULL,
  `uid` varchar(100) DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `perishable` tinyint(1) NOT NULL DEFAULT '0',
  `manufactureDate` date DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`inventoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventories_backup`
--

DROP TABLE IF EXISTS `inventories_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventories_backup` (
  `inventoryId` int NOT NULL DEFAULT '0',
  `productId` int DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `donationId` int DEFAULT NULL,
  `disasterRequestId` int DEFAULT NULL,
  `sourceType` varchar(20) DEFAULT NULL,
  `amount` int DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `disasterName` varchar(255) DEFAULT NULL,
  `requestedItem` varchar(255) DEFAULT NULL,
  `uid` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory_assets`
--

DROP TABLE IF EXISTS `inventory_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_assets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` varchar(64) NOT NULL,
  `barcode` varchar(128) NOT NULL,
  `asset_type` enum('MONEY','PRODUCT') NOT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT '1.00',
  `unit` varchar(50) DEFAULT NULL,
  `status` enum('CREATED','RECEIVED','STORED','ALLOCATED','DISPATCHED','DELIVERED','EXPIRED','REJECTED') NOT NULL DEFAULT 'CREATED',
  `location` varchar(255) DEFAULT 'WAREHOUSE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notificationId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('approved','rejected','info') DEFAULT 'info',
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notificationId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `orphanages`
--

DROP TABLE IF EXISTS `orphanages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orphanages` (
  `orphanageId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `contactPerson` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  PRIMARY KEY (`orphanageId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product_metadata`
--

DROP TABLE IF EXISTS `product_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_metadata` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `perishable` tinyint(1) DEFAULT '0',
  `manufacture_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `ai_status` enum('approved','rejected','review') DEFAULT 'review',
  `ai_confidence` decimal(5,2) DEFAULT '0.00',
  `ai_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_id` (`inventory_id`),
  CONSTRAINT `product_metadata_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_assets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productcatalog`
--

DROP TABLE IF EXISTS `productcatalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productcatalog` (
  `catalogId` int NOT NULL AUTO_INCREMENT,
  `barcode` varchar(255) DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `categories` varchar(255) DEFAULT NULL,
  `defaultExpiryDays` int DEFAULT NULL,
  `lastFetchedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`catalogId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `redirectedproducts`
--

DROP TABLE IF EXISTS `redirectedproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `redirectedproducts` (
  `redirectId` int NOT NULL AUTO_INCREMENT,
  `productId` int DEFAULT NULL,
  `orphanageId` int DEFAULT NULL,
  `redirectedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`redirectId`),
  KEY `productId` (`productId`),
  KEY `orphanageId` (`orphanageId`),
  CONSTRAINT `redirectedproducts_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `donatedproducts` (`productId`) ON DELETE CASCADE,
  CONSTRAINT `redirectedproducts_ibfk_2` FOREIGN KEY (`orphanageId`) REFERENCES `orphanages` (`orphanageId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tracking_events`
--

DROP TABLE IF EXISTS `tracking_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracking_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `inventory_id` bigint NOT NULL,
  `event_type` enum('CREATED','RECEIVED','STORED','ALLOCATED','DISPATCHED','DELIVERED','EXPIRED','REJECTED') NOT NULL,
  `from_location` varchar(255) DEFAULT NULL,
  `to_location` varchar(255) DEFAULT NULL,
  `actor` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inventory_id` (`inventory_id`),
  CONSTRAINT `tracking_events_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_assets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trackinghistory`
--

DROP TABLE IF EXISTS `trackinghistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trackinghistory` (
  `trackId` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `inventoryId` int NOT NULL,
  `sourceType` varchar(50) NOT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `donationId` int DEFAULT NULL,
  `disasterRequestId` int DEFAULT NULL,
  `fromLocation` varchar(255) DEFAULT 'Main Warehouse',
  `toType` enum('orphanage','disaster') NOT NULL,
  `toName` varchar(255) DEFAULT NULL,
  `dispatchedBy` varchar(255) DEFAULT NULL,
  `dispatchDate` datetime DEFAULT NULL,
  `deliveredDate` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Dispatched',
  `remarks` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`trackId`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_verified` tinyint(1) DEFAULT '0',
  `otp` varchar(6) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `donations_anonymous` tinyint(1) DEFAULT '0',
  `notifications_enabled` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-14 19:37:40
