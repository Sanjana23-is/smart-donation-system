const express = require("express");
const router = express.Router();
const db = require("../db");

/* ------------------------------------------------------
   1) CREATE FIRST REDIRECT ENTRY
   Called from: POST /api/redirect  (AdminRedirect → saveRedirect)
------------------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const {
      inventoryId,
      uid,
      sourceType,
      productName,
      donationId,
      disasterRequestId,
      toType,
      toName,
      dispatchedBy,
      dispatchDate,
      remarks,
    } = req.body;

    if (!inventoryId || !uid || !sourceType || !toType || !toName || !dispatchDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await db.query(
      `INSERT INTO trackinghistory
       (uid, inventoryId, sourceType, productName, donationId, disasterRequestId,
        fromLocation, toType, toName, dispatchedBy, dispatchDate, status, remarks)
       VALUES
       (?, ?, ?, ?, ?, ?, 'Main Warehouse', ?, ?, ?, ?, 'Dispatched', ?)`,
       [
         uid,
         inventoryId,
         sourceType,
         productName || null,
         donationId || null,
         disasterRequestId || null,
         toType,
         toName,
         dispatchedBy || "Admin",
         dispatchDate,
         remarks || null,
       ]
    );

    return res.json({ message: "Redirect saved successfully!" });

  } catch (err) {
    console.error("TRACKING CREATE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ------------------------------------------------------
   2) LIST LATEST STATUS PER UID FOR ADMIN TABLE
   Called from: GET /api/redirect/history/all  (AdminRedirect initial load)
------------------------------------------------------- */
router.get("/history/all", async (req, res) => {
  try {
    // Get latest trackId per UID
    const [rows] = await db.query(
      `SELECT th.*
       FROM trackinghistory th
       INNER JOIN (
         SELECT uid, MAX(trackId) AS maxId
         FROM trackinghistory
         GROUP BY uid
       ) latest
         ON th.uid = latest.uid AND th.trackId = latest.maxId
       ORDER BY th.dispatchDate DESC`
    );

    return res.json(rows || []);

  } catch (err) {
    console.error("TRACKING HISTORY ALL ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ------------------------------------------------------
   3) GET FULL TIMELINE FOR ONE UID
   Called from: GET /api/redirect/:uid  (AdminRedirect → openTimeline)
------------------------------------------------------- */
router.get("/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;

    const [rows] = await db.query(
      `SELECT *
       FROM trackinghistory
       WHERE uid = ?
       ORDER BY createdAt ASC, trackId ASC`,
      [uid]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "UID not found" });
    }

    return res.json(rows);

  } catch (err) {
    console.error("FETCH HISTORY ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ------------------------------------------------------
   4) MARK DELIVERED (update latest row for UID)
   Called from: POST /api/redirect/:uid/markdelivered
   Frontend passes: deliveredDate, location, remarks
   NOTE: there is no 'location' column in table,
         so we append it into remarks.
------------------------------------------------------- */
router.post("/:uid/markdelivered", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { deliveredDate, location, remarks } = req.body;

    if (!deliveredDate) {
      return res.status(400).json({ error: "deliveredDate is required" });
    }

    // find latest record for this uid
    const [latestRows] = await db.query(
      `SELECT trackId, remarks
       FROM trackinghistory
       WHERE uid = ?
       ORDER BY trackId DESC
       LIMIT 1`,
      [uid]
    );

    if (!latestRows || latestRows.length === 0) {
      return res.status(404).json({ error: "UID not found" });
    }

    const latest = latestRows[0];

    // store location inside remarks (because table has no location column)
    const mergedRemarks =
      (location ? `Location: ${location}. ` : "") +
      (remarks ?? latest.remarks ?? "");

    await db.query(
      `UPDATE trackinghistory
       SET deliveredDate = ?, status = 'Delivered', remarks = ?
       WHERE trackId = ?`,
      [deliveredDate, mergedRemarks || null, latest.trackId]
    );

    return res.json({ message: "Marked as delivered" });

  } catch (err) {
    console.error("MARK DELIVERED ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ------------------------------------------------------
   5) EDIT LATEST ENTRY (inline edit in table)
   Called from: PUT /api/redirect/:uid/update
------------------------------------------------------- */
router.put("/:uid/update", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { status, location, remarks } = req.body;

    const [latestRows] = await db.query(
      `SELECT trackId, remarks
       FROM trackinghistory
       WHERE uid = ?
       ORDER BY trackId DESC
       LIMIT 1`,
      [uid]
    );

    if (!latestRows || latestRows.length === 0) {
      return res.status(404).json({ error: "UID not found" });
    }

    const latest = latestRows[0];

    const mergedRemarks =
      (location ? `Location: ${location}. ` : "") +
      (remarks ?? latest.remarks ?? "");

    await db.query(
      `UPDATE trackinghistory
       SET
         status = COALESCE(?, status),
         remarks = ?
       WHERE trackId = ?`,
      [status || null, mergedRemarks || null, latest.trackId]
    );

    return res.json({ message: "Latest update edited" });

  } catch (err) {
    console.error("UPDATE LATEST ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


/* ------------------------------------------------------
   6) ADD A NEW TIMELINE ENTRY (manual update)
   Called from: POST /api/redirect/:uid/addupdate
------------------------------------------------------- */
router.post("/:uid/addupdate", async (req, res) => {
  try {
    const uid = req.params.uid;
    const { status, location, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    // Need some base data from the latest record (inventoryId, etc.)
    const [latestRows] = await db.query(
      `SELECT *
       FROM trackinghistory
       WHERE uid = ?
       ORDER BY trackId DESC
       LIMIT 1`,
      [uid]
    );

    if (!latestRows || latestRows.length === 0) {
      return res.status(404).json({ error: "UID not found" });
    }

    const latest = latestRows[0];

    const mergedRemarks =
      (location ? `Location: ${location}. ` : "") +
      (remarks ?? "");

    await db.query(
      `INSERT INTO trackinghistory
       (uid, inventoryId, sourceType, productName, donationId, disasterRequestId,
        fromLocation, toType, toName, dispatchedBy, dispatchDate, deliveredDate,
        status, remarks)
       VALUES
       (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        latest.uid,
        latest.inventoryId,
        latest.sourceType,
        latest.productName,
        latest.donationId,
        latest.disasterRequestId,
        latest.fromLocation,
        latest.toType,
        latest.toName,
        latest.dispatchedBy,
        latest.dispatchDate,
        latest.deliveredDate,
        status,
        mergedRemarks || null,
      ]
    );

    return res.json({ message: "New timeline step added" });

  } catch (err) {
    console.error("ADD UPDATE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;
