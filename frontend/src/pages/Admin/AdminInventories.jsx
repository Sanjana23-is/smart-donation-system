import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminNav from "./AdminNav";

export default function AdminInventories() {
  const [inventories, setInventories] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [invRes, alertRes] = await Promise.all([
        api.get("/inventories"),
        api.get("/expiry-alerts"),
      ]);

      setInventories(invRes.data || []);
      setExpiryAlerts(alertRes.data || []);
    } catch (e) {
      console.error("Error loading inventories:", e);
    }
  }

  // 🔹 Helper: format date as dd/mm/yyyy
  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // 🔹 NEW: show only physical stock (hide money-donation rows)
  const visibleInventories = inventories.filter(
    (inv) => inv.sourceType !== "donation"
  );

  // quick lookup for days-to-expiry from /expiry-alerts (if you use it)
  const daysMap = expiryAlerts.reduce((acc, a) => {
    acc[a.inventoryId] = a.daysToExpiry;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center mb-8">
          📦 Inventory Records
        </h1>

        <div className="bg-white shadow-xl rounded-2xl overflow-x-auto border">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Product ID</th>
                <th className="p-3 border">Product Name</th>
                <th className="p-3 border">Location</th>
                <th className="p-3 border">Quantity</th>
                <th className="p-3 border">Unit</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Expiry Date</th>
                <th className="p-3 border">Days to Expiry</th>
              </tr>
            </thead>

            <tbody>
              {visibleInventories.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-gray-500 border"
                  >
                    No inventory items to display.
                  </td>
                </tr>
              ) : (
                visibleInventories.map((inv) => {
                  const days = daysMap[inv.inventoryId];

                  return (
                    <tr key={inv.inventoryId} className="hover:bg-gray-50">
                      <td className="p-3 border">{inv.inventoryId}</td>
                      <td className="p-3 border">
                        {inv.productId ?? "—"}
                      </td>
                      <td className="p-3 border">
                        {inv.productName || inv.requestedItem || "—"}
                      </td>
                      <td className="p-3 border">{inv.location}</td>
                      <td className="p-3 border">
                        {inv.quantity != null ? inv.quantity : "—"}
                      </td>
                      <td className="p-3 border">{inv.unit || "—"}</td>
                      <td className="p-3 border">{inv.status}</td>
                      <td className="p-3 border">
                        {formatDate(inv.expiryDate)}
                      </td>
                      <td className="p-3 border">
                        {days == null
                          ? "—"
                          : days <= 0
                          ? (
                            <span className="text-red-600 font-semibold">
                              0 (expiring soon)
                            </span>
                          )
                          : days <= 30
                          ? (
                            <span className="text-orange-600 font-semibold">
                              {days} (expiring soon)
                            </span>
                          )
                          : days}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
