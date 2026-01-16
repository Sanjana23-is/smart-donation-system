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
    } catch (err) {
      console.error("Inventory load failed:", err);
    }
  }

  function formatDate(date) {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-GB");
  }

  const visibleInventories = inventories.filter(
    (inv) => inv.sourceType !== "donation"
  );

  const daysMap = expiryAlerts.reduce((acc, item) => {
    acc[item.inventoryId] = item.daysLeft ?? item.daysToExpiry;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          📦 Inventory Records
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-800 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3 text-center">Days Left</th>
                </tr>
              </thead>

              <tbody>
                {visibleInventories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  visibleInventories.map((inv, idx) => {
                    const days = daysMap[inv.inventoryId];

                    let daysStyle = "text-gray-700";
                    if (days <= 0) daysStyle = "text-red-600 font-bold";
                    else if (days <= 30)
                      daysStyle = "text-orange-600 font-semibold";

                    return (
                      <tr
                        key={inv.inventoryId}
                        className={`border-b ${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-blue-50 transition`}
                      >
                        <td className="px-4 py-3">
                          {inv.inventoryId}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {inv.productName ||
                            inv.requestedItem ||
                            "—"}
                        </td>

                        <td className="px-4 py-3">
                          {inv.location}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {inv.quantity ?? "—"}
                        </td>

                        <td className="px-4 py-3">
                          {inv.unit || "—"}
                        </td>

                        <td className="px-4 py-3 capitalize">
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                            {inv.status}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {formatDate(inv.expiryDate)}
                        </td>

                        <td className={`px-4 py-3 text-center ${daysStyle}`}>
                          {days == null ? "—" : days}
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
    </div>
  );
}
