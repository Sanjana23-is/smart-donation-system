import React, { useEffect, useState } from "react";
import { Users, Gift, Package } from "lucide-react";
import api from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    donors: 0,
    totalAmount: 0,
    products: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const donors = await api.get("/donors");
      const donations = await api.get("/donations");
      const products = await api.get("/donated-products");

      // Sum of all donation amounts
      const totalAmount = donations.data.reduce((sum, d) => {
        const value = parseFloat(d.amount);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      setStats({
        donors: donors.data.length,
        totalAmount,
        products: products.data.length,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-6 py-10">
      {/* ---- HEADER ---- */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Welcome to the Donation Management System
        </h1>

        <p className="text-gray-500 text-lg mt-2">
          Smart, professional & secure dashboard for managing donors and donations.
        </p>
      </div>

      {/* ---- STAT CARDS ---- */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          icon={<Users size={34} />}
          title="Total Donors"
          value={stats.donors}
          accent="#3b82f6"
        />

        {/* Total Money Donated */}
        <StatCard
          icon={<Gift size={34} />}
          title="Total Money Donated"
          value={`₹${stats.totalAmount}`}
          accent="#10b981"
        />

        <StatCard
          icon={<Package size={34} />}
          title="Products Donated"
          value={stats.products}
          accent="#f59e0b"
        />
      </div>

      {/* ---- INSIGHTS AREA ---- */}
      <div className="max-w-5xl mx-auto mt-14 bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Insights</h2>
        <p className="text-gray-600 leading-relaxed">
          Your dashboard gives real-time stats for donors, total money donated and contributed products.
          All components are optimized for speed, security and clean UI.
        </p>
      </div>

      {/* ---- FOOTER ---- */}
     
    </div>
  );
}

/* ----------- COMPONENT: STAT CARD ------------- */
function StatCard({ icon, title, value, accent }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100
                    hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white shadow-md"
        style={{ background: accent }}
      >
        {icon}
      </div>

      <h3 className="text-gray-600 text-lg font-medium">{title}</h3>

      <p className="text-4xl font-bold mt-1 text-gray-900">{value}</p>
    </div>
  );
}
