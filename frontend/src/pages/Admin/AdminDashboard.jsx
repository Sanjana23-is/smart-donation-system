import React, { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import api from "../../api";
import {
  FiUsers,
  FiBox,
  FiPackage,
  FiAlertCircle,
  FiTruck,
  FiAlertTriangle,
} from "react-icons/fi";

export default function AdminDashboard() {
  const [expiringSoon, setExpiringSoon] = useState([]);

  // -----------------------
  // Load items expiring in next 30 days
  // -----------------------
  useEffect(() => {
    loadExpiryAlerts();
  }, []);

  async function loadExpiryAlerts() {
    try {
      const res = await api.get("/expiry-alerts"); // hits /api/expiry-alerts
      setExpiringSoon(res.data || []);
    } catch (err) {
      console.error("❌ Error loading expiry alerts:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <AdminNav />

      <div className="p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Manage donations, products, inventory, disaster requests & redirects
            efficiently.
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            icon={<FiPackage size={35} />}
            label="Pending Donations"
            value="Review Now"
            color="from-green-400 to-green-600"
            link="/admin/donations"
          />

          <StatCard
            icon={<FiBox size={35} />}
            label="Pending Products"
            value="Review Now"
            color="from-yellow-400 to-yellow-600"
            link="/admin/products"
          />

          <StatCard
            icon={<FiAlertCircle size={35} />}
            label="Disaster Requests"
            value="View Requests"
            color="from-red-400 to-red-600"
            link="/admin/requests"
          />

          <StatCard
            icon={<FiUsers size={35} />}
            label="Inventory Items"
            value="View Inventory"
            color="from-purple-400 to-purple-600"
            link="/admin/inventories"
          />

          {/* NEW CARD: Expiring Soon */}
          <StatCard
            icon={<FiAlertTriangle size={35} />}
            label="Expiring Soon"
            value={`${expiringSoon.length} item(s)`}
            color="from-orange-400 to-orange-600"
            link="/admin/inventories"
          />
        </div>

        {/* QUICK ACCESS */}
        <h2 className="text-2xl font-bold mt-12 mb-4 text-gray-800">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickLink
            label="Manage Donations"
            to="/admin/donations"
            icon={<FiPackage />}
          />
          <QuickLink
            label="Manage Products"
            to="/admin/products"
            icon={<FiBox />}
          />
          <QuickLink
            label="Manage Disaster Requests"
            to="/admin/requests"
            icon={<FiAlertCircle />}
          />
          <QuickLink
            label="Manage Orphanages"
            to="/admin/orphanages"
            icon={<FiUsers />}
          />
          <QuickLink
            label="Manage Inventory"
            to="/admin/inventories"
            icon={<FiBox />}
          />
          <QuickLink
            label="Redirect Inventory"
            to="/admin/redirect"
            icon={<FiTruck />}
          />
        </div>

        {/* EXPIRY ALERT TABLE */}
        {expiringSoon.length > 0 && (
          <div className="mt-12 bg-white rounded-xl p-6 shadow-lg border border-red-100">
            <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
              <FiAlertTriangle />
              Items Expiring Within 30 Days
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border">Product</th>
                    <th className="p-3 border">Quantity</th>
                    <th className="p-3 border">Unit</th>
                    <th className="p-3 border">Expiry Date</th>
                    <th className="p-3 border">Days Left</th>
                  </tr>
                </thead>

                <tbody>
                  {expiringSoon.map((item) => (
                    <tr
                      key={item.inventoryId}
                      className="border-t hover:bg-red-50/40 transition"
                    >
                      <td className="p-3 border">{item.productName}</td>
                      <td className="p-3 border">{item.quantity}</td>
                      <td className="p-3 border">{item.unit}</td>
                      <td className="p-3 border">
                        {item.expiryDate
                          ? new Date(item.expiryDate).toLocaleDateString(
                              "en-GB"
                            )
                          : "—"}
                      </td>
                      <td className="p-3 border font-bold text-red-600">
                        {item.daysLeft} day(s)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Suggestion: Prioritise dispatching these items to orphanages
              before they expire.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* STAT CARD */
/* ------------------------------------------------ */
function StatCard({ icon, label, value, color, link }) {
  return (
    <a href={link}>
      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition border border-gray-200 cursor-pointer transform hover:-translate-y-1">
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}
          >
            {icon}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700">{label}</p>
            <p className="text-sm text-gray-500">{value}</p>
          </div>
        </div>
      </div>
    </a>
  );
}

/* ------------------------------------------------ */
/* QUICK ACCESS COMPONENT */
/* ------------------------------------------------ */
function QuickLink({ label, to, icon }) {
  return (
    <a href={to}>
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl border border-gray-200 transition transform hover:-translate-y-1">
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-gray-800 text-xl">{icon}</span>
          <span className="font-semibold">{label}</span>
        </div>
      </div>
    </a>
  );
}
