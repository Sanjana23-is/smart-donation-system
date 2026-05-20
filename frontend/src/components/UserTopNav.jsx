import React, { useState, useRef, useEffect } from "react";
import { FiUser, FiLogOut, FiSettings, FiBell } from "react-icons/fi";

export default function UserTopNav({ current, setCurrent }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const topItems = [
    { id: "Dashboard", label: "Dashboard" },
    { id: "Donations", label: "Donations" },
    { id: "Products", label: "Products" },
    { id: "RequestDisaster", label: "Requests" }
  ];

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm h-16 flex items-center px-6">
      
      {/* BRANDING */}
      <div className="flex-shrink-0 flex items-center mr-8">
        <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight cursor-pointer" onClick={() => setCurrent("Dashboard")}>
          Donation Tracker
        </h1>
      </div>

      {/* TOP NAV LINKS */}
      <div className="flex-1 flex gap-2">
        {topItems.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrent(item.id)}
              className={`relative px-4 py-2 font-semibold text-sm transition-all duration-200 rounded-lg ${
                active
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-1/2 h-[3px] bg-blue-600 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATIONS (BELL) */}
      <button 
        onClick={() => setCurrent("Notifications")}
        className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors mr-2 hover:bg-gray-100 rounded-full"
      >
        <FiBell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* PROFILE DROPDOWN */}
      <div className="relative ml-4" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors border border-gray-300 shadow-sm"
        >
          <FiUser size={20} />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 origin-top-right animate-fade-in-down">
            <div className="px-4 py-3 border-b border-gray-100 mb-1">
              <p className="text-sm text-gray-500 font-medium">Signed in as</p>
              <p className="text-sm font-bold text-gray-800 truncate">Donor Profile</p>
            </div>
            
            <button
              onClick={() => { setProfileOpen(false); setCurrent("Profile"); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2"
            >
              <FiUser /> My Profile
            </button>
            <button
              onClick={() => { setProfileOpen(false); setCurrent("Settings"); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2"
            >
              <FiSettings /> Settings
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
