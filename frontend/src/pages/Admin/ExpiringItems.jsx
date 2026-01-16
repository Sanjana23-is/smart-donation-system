import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "./AdminNav";
import api from "../../api";
import { FiAlertTriangle, FiTruck } from "react-icons/fi";

export default function AdminExpiring() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/expiry-alerts");
      setItems(res.data || []);
    } catch (e) {
      console.error("Error loading expiring items", e);
    }
  }

  function goToRedirect(inventoryId) {
    navigate(`/admin/redirect?inventoryId=${inventoryId}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2 mb-6">
          <FiAlertTriangle />
          Items Expiring Soon
        </h1>

        <div className="bg-white shadow-xl rounded-2xl overflow-x-auto border">
          <table className="w-full text-left">
            <thead className="bg-red-50 text-red-700">
              <tr>
                <th className="p-3 border">Inventory ID</th>
                <th className="p-3 border">Product</th>
                <th className="p-3 border">Quantity</th>
                <th className="p-3 border">Unit</th>
                <th className="p-3 border">Expiry Date</th>
                <th className="p-3 border">Days Left</th>
                <th className="p-3 border text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-4 text-center text-gray-500 border"
                  >
                    No expiring items found.
                  </td>
                </tr>
              ) : (
                items.map((i) => (
                  <tr
                    key={i.inventoryId}
                    className="hover:bg-red-50/40 transition"
                  >
                    <td className="p-3 border">{i.inventoryId}</td>
                    <td className="p-3 border">{i.productName}</td>
                    <td className="p-3 border">{i.quantity}</td>
                    <td className="p-3 border">{i.unit}</td>
                    <td className="p-3 border">
                      {new Date(i.expiryDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-3 border font-bold text-red-600">
                      {i.daysLeft}
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={() => goToRedirect(i.inventoryId)}
                        className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                      >
                        <FiTruck />
                        Redirect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Recommendation: Redirect these items immediately to orphanages or
          disaster locations to prevent wastage.
        </p>
      </div>
    </div>
  );
}
