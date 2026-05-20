import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiWind, FiBox, FiTruck, FiAlertTriangle } from "react-icons/fi";

export default function AdminSidebar() {
  const location = useLocation();

  const items = [
    { name: "Orphanages", to: "/admin/orphanages", icon: <FiHome /> },
    { name: "Disasters", to: "/admin/disasters", icon: <FiWind /> },
    { name: "Inventories", to: "/admin/inventories", icon: <FiBox /> },
    { name: "Redirect", to: "/admin/redirect", icon: <FiTruck /> },
    { name: "Expiring Items", to: "/admin/expiring", icon: <FiAlertTriangle /> },
  ];

  return (
    <div className="w-64 bg-[#0B1220] text-gray-300 border-r border-white/10 flex flex-col hidden md:flex shadow-2xl">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-wider uppercase text-sm">System Mgmt</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-3">
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`text-lg ${active ? "text-blue-400" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
