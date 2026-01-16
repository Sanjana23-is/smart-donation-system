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
  const [expiringCount, setExpiringCount] = useState(0);

  // -----------------------
  // Load expiry count only
  // -----------------------
  useEffect(() => {
    loadExpiryCount();
  }, []);

  async function loadExpiryCount() {
    try {
      const res = await api.get("/expiry-alerts");
      setExpiringCount(res.data?.length || 0);
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

          {/* ✅ FIXED: Expiring Soon → dedicated page */}
          <StatCard
            icon={<FiAlertTriangle size={35} />}
            label="Expiring Soon"
            value={`${expiringCount} item(s)`}
            color="from-orange-400 to-orange-600"
            link="/admin/expiring"
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
/* QUICK LINK */
/* ------------------------------------------------ */
function QuickLink({ label, to, icon }) {
  return (
    <a href={to}>
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl border border-gray-200 transition transform hover:-translate-y-1">
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold">{label}</span>
        </div>
      </div>
    </a>
  );
}
