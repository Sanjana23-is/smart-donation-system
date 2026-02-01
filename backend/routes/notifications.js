const express = require("express");
const router = express.Router();
const db = require("../db");
const userAuth = require("../middleware/userAuth");

// GET /api/notifications/my
router.get("/my", userAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(`🔔 Fetching notifications for userId: ${userId} (Type: ${typeof userId})`);
        // User requested "my" notifications
        const [rows] = await db.query(
            "SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC",
            [userId]
        );
        console.log(`✅ Found ${rows.length} notifications for userId: ${userId}`);
        res.json(rows);
    } catch (err) {
        console.error("❌ FETCH NOTIFICATIONS ERROR:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// GET unread count
router.get("/unread-count", userAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [rows] = await db.query(
            "SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = FALSE",
            [userId]
        );
        res.json({ count: rows[0].count });
    } catch (err) {
        console.error("❌ UNREAD COUNT ERROR:", err);
        res.status(500).json({ error: "Failed to fetch count" });
    }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", userAuth, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.userId;

        const [result] = await db.query(
            "UPDATE notifications SET isRead = TRUE WHERE notificationId = ? AND userId = ?",
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Notification not found or access denied" });
        }

        res.json({ message: "Marked as read" });
    } catch (err) {
        console.error("❌ MARK READ ERROR:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
