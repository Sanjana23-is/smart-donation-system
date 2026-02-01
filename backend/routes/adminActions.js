const express = require("express");
const router = express.Router();
const db = require("../db");
const { sendNotificationEmail } = require("../utils/emailService");

/* ===============================
   GET PENDING PRODUCTS
================================ */
router.get("/pending-products", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM donatedProducts
      WHERE status = 'pending'
      ORDER BY donatedAt DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ FETCH PENDING PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch pending products" });
  }
});

/* ===============================
   APPROVE / REJECT PRODUCT
   (USES productId — NOT uid)
================================ */
router.put("/product/:id/decision", async (req, res) => {
  const productId = Number(req.params.id);
  const { decision, adminRemark } = req.body;

  // 🔒 Hard validation
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  let connection;
  try {
    // Get a specific connection for transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    /* ---------- 1. FETCH PRODUCT (LOCK ROW) ---------- */
    // Also fetch userId and donorId to resolve ownership
    const [[product]] = await connection.query(
      "SELECT * FROM donatedProducts WHERE productId = ? FOR UPDATE",
      [productId]
    );

    if (!product) {
      await connection.rollback();
      return res.status(404).json({ error: "Product not found" });
    }

    // 🛑 Prevent duplicate approval
    if (product.status === 'approved' && decision === 'approved') {
      await connection.rollback();
      return res.status(200).json({ message: "Product already approved" });
    }

    /* ---------- 2. UPDATE STATUS ---------- */
    await connection.query(
      `UPDATE donatedProducts
       SET status = ?, admin_remark = ?
       WHERE productId = ?`,
      [decision, adminRemark || null, productId]
    );

    /* ---------- 3. HANDLE NOTIFICATIONS (Async/Indep) ---------- */
    // 🚨 FIX: Strict Priority to userId
    let targetUserId = product.userId;

    // Logging to debug ownership
    console.log(`🔍 NOTIFICATION CHECK:`);
    console.log(`   - Product ID: ${productId}`);
    console.log(`   - Product Name: ${product.productName}`);
    console.log(`   - Data: userId=[${product.userId}] donorId=[${product.donorId}]`);

    if (!targetUserId) {
      console.warn("⚠️ WARNING: This product has NO 'userId' linked.");
      console.warn("   -> Attempting fallback to 'donorId' (Legacy mode)");
      targetUserId = product.donorId;
    } else {
      console.log(`✅ Using Authenticated User ID: ${targetUserId}`);
    }

    // Prepare notification data
    const notificationData = {
      donorId: targetUserId, // Passing resolved ID
      productName: product.productName,
      decision,
      adminRemark
    };

    /* ---------- 4. IF REJECTED - STOP HERE ---------- */
    if (decision === "rejected") {
      await connection.commit();

      // Send Notification (Fire & Forget)
      sendDecisionNotification(notificationData);

      return res.json({ message: "Product rejected by admin" });
    }

    /* ---------- 5. INSERT INTO INVENTORY ---------- */
    // Ensure we have a UID (fallback if missing)
    const productUid = product.uid || `PROD-${Date.now()}`;

    const [invResult] = await connection.query(
      `INSERT INTO inventories
       (sourceType, productId, productName, quantity, unit,
        location, status, uid, perishable,
        manufactureDate, expiryDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'product',                // sourceType
        product.productId,        // productId
        product.productName,      // productName
        product.quantity,         // quantity
        product.unit,             // unit
        'Main Warehouse',         // location
        'received',               // status
        productUid,               // uid
        product.perishable,       // perishable
        product.manufactureDate,  // manufactureDate
        product.expiryDate        // expiryDate
      ]
    );

    const inventoryId = invResult.insertId;

    /* ---------- 6. INSERT TRACKING HISTORY ---------- */
    // Using transaction connection
    await connection.query(
      `INSERT INTO trackinghistory
       (uid, inventoryId, sourceType, productName, status, toName, createdAt)
       VALUES (?, ?, 'product', ?, 'approved', 'Main Warehouse', NOW())`,
      [productUid, inventoryId, product.productName]
    );

    // ✅ COMMIT TRANSACTION
    await connection.commit();

    // Send Notification (Fire & Forget)
    sendDecisionNotification(notificationData);

    res.json({
      message: "Product approved and moved to inventory",
      inventoryId,
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ ADMIN PRODUCT DECISION ERROR:", err);
    res.status(500).json({ error: "Internal server error: " + err.message });
  } finally {
    if (connection) connection.release();
  }
});

/* ===============================
   HELPER: SEND NOTIFICATIONS
================================ */
async function sendDecisionNotification({ donorId, productName, decision, adminRemark }) {
  // donorId argument here effectively means userId.
  // We renamed the property in the caller for compatibility, but it MUST be a valid userId now.

  if (!donorId) {
    console.error("❌ NOTIFICATION ERROR: No User ID provided. Cannot send notification.");
    return;
  }

  console.log("📨 sendDecisionNotification() CALLED");
  console.log("   → Target User ID:", donorId);
  console.log("   → Product:", productName);
  console.log("   → Decision:", decision);

  try {
    /* ---------- 1. FETCH USER EMAIL (STRICT: USERS TABLE ONLY) ---------- */
    // We do NOT check the donors table anymore. Data ownership must be users.userId.
    const [[user]] = await db.query(
      "SELECT email, name FROM users WHERE userId = ?",
      [donorId]
    );

    let donorEmail = null;
    let donorName = "User";

    if (user) {
      donorEmail = user.email;
      donorName = user.name || "User";
      console.log(`✅ Email details found for User ID ${donorId}: ${donorEmail}`);
    } else {
      console.warn(`⚠️ User ID ${donorId} NOT found in 'users' table.`);
      console.warn("   -> Skipping email notification (No valid recipient).");
    }

    /* ---------- 2. BUILD MESSAGE ---------- */
    let title, message, type, emailSubject, emailBody;

    if (decision === "approved") {
      title = "Product Approved";
      message = `Your product "${productName}" has been approved. Please proceed with delivery.`;
      type = "approved";
      emailSubject = "🎉 Donation Approved";
      emailBody = `
          <p>Hello ${donorName},</p>
          <p>Your product <strong>${productName}</strong> has been approved.</p>
          <p>Please proceed with delivery to the main warehouse.</p>
          <p>Thank you for contributing.</p>
        `;
    } else {
      title = "Product Rejected";
      message = `Your product "${productName}" was rejected. Reason: ${adminRemark || "Administrative decision"}`;
      type = "rejected";
      emailSubject = "❌ Donation Rejected";
      emailBody = `
          <p>Hello ${donorName},</p>
          <p>Your product <strong>${productName}</strong> was rejected.</p>
          <p>Reason: ${adminRemark || "Administrative decision"}</p>
        `;
    }

    /* ---------- 3. INSERT IN-APP NOTIFICATION ---------- */
    // This always happens if we have a userId, even if email is missing
    console.log(`🔔 Creating in-app notification for User ID: ${donorId}`);
    await db.query(
      `INSERT INTO notifications (userId, title, message, type, createdAt) 
         VALUES (?, ?, ?, ?, NOW())`,
      [donorId, title, message, type]
    );

    /* ---------- 4. SEND EMAIL (IF EMAIL EXISTS) ---------- */
    if (donorEmail) {
      console.log(`📤 Sending email to ${donorEmail}...`);
      await sendNotificationEmail(donorEmail, emailSubject, emailBody);
    } else {
      console.log("ℹ️ Email step skipped (No email address).");
    }

  } catch (err) {
    console.error("🔥 NOTIFICATION FAILURE:", err);
  }
}

/* ===============================
   APPROVE / REJECT MONEY DONATION
================================ */
router.put("/donation/:id/decision", async (req, res) => {
  const donationId = Number(req.params.id);
  const { decision } = req.body;

  if (!Number.isInteger(donationId)) {
    return res.status(400).json({ error: "Invalid donationId" });
  }

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  try {
    const [result] = await db.query(
      `UPDATE donations SET status = ? WHERE donationId = ?`,
      [decision, donationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Donation not found" });
    }

    // --- FETCH DONATION FOR NOTIFICATION ---
    const [[donation]] = await db.query("SELECT * FROM donations WHERE donationId = ?", [donationId]);

    if (donation) {
      // Prioritize userId (if we added it to donations table) or fallback for now.
      // Money donation notifications might still rely on donorId if schema wasn't updated there,
      // but assuming consistency across the app.
      const targetUserId = donation.userId || donation.donorId;

      console.log(`🔍 MONEY DONATION CHECK: userId=[${donation.userId}] donorId=[${donation.donorId}]`);
      console.log(`👉 TARGET NOTIFICATION USER ID: ${targetUserId}`);

      sendDecisionNotification({
        donorId: targetUserId,
        productName: `Money Donation (₹${donation.amount})`,
        decision,
        adminRemark: "Clean admin decision"
      });
    }

    res.json({ message: `Donation ${decision}` });
  } catch (err) {
    console.error("❌ DONATION DECISION ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
