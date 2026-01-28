router.get("/pending-products", async (req, res) => {
  const [rows] = await db.query(`
    SELECT * FROM donatedProducts
    WHERE status = 'pending'
    ORDER BY donatedAt DESC
  `);
  res.json(rows);
});

router.put("/product/:id/decision", async (req, res) => {
  const { decision, adminRemark } = req.body;
  const productId = req.params.id;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  await db.query(
    `UPDATE donatedProducts
     SET status = ?, admin_remark = ?
     WHERE productId = ?`,
    [decision, adminRemark || null, productId]
  );

  if (decision === "rejected") {
    return res.json({ message: "Product rejected" });
  }

  const [[p]] = await db.query(
    "SELECT * FROM donatedProducts WHERE productId = ?",
    [productId]
  );

  const [inv] = await db.query(
    `INSERT INTO inventories
     (sourceType, productId, productName, quantity, unit, location, status, uid)
     VALUES ('product', ?, ?, ?, ?, 'Main Warehouse', 'received', ?)`,
    [p.productId, p.productName, p.quantity, p.unit, p.uid]
  );

  await db.query(
    `INSERT INTO trackinghistory
     (uid, inventoryId, sourceType, productName, status, toName, createdAt)
     VALUES (?, ?, 'product', ?, 'Created', 'Admin', NOW())`,
    [p.uid, inv.insertId, p.productName]
  );

  res.json({ message: "Product approved", inventoryId: inv.insertId });
});
