import React from "react";
import { FiUsers, FiBox, FiAlertCircle, FiWind, FiHome } from "react-icons/fi";

export default function UserSidebar({ current, setCurrent }) {
  const items = [
    { id: "Donors", label: "Donors", icon: <FiUsers /> },
    { id: "Track", label: "Track Donations", icon: <FiBox /> },
    { id: "Disasters", label: "Disasters", icon: <FiWind /> },
    { id: "Orphanages", label: "Orphanages", icon: <FiHome /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Quick Links</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {items.map((item) => {
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrent(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={`text-lg ${active ? "text-blue-600" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
