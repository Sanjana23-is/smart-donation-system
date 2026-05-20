import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiSettings, FiBell } from "react-icons/fi";

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const links = [
    { name: "Dashboard", to: "/admin/dashboard" },
    { name: "Donations", to: "/admin/donations" },
    { name: "Products", to: "/admin/products" },
    { name: "Requests", to: "/admin/requests" },
  ];

  function handleLogout() {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
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
    <nav className="bg-[#0B1220]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 h-16 flex items-center px-6">
      
      {/* BRANDING */}
      <div className="flex-shrink-0 flex items-center mr-8">
        <h1 className="text-white text-xl font-bold tracking-wide">
          Admin Panel
        </h1>
      </div>

      {/* TOP NAV LINKS */}
      <div className="flex-1 flex gap-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`relative px-4 py-2 font-semibold text-sm transition-all duration-200 rounded-lg ${
              location.pathname === link.to
                ? "text-blue-400 bg-white/5"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {link.name}
            {location.pathname === link.to && (
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-1/2 h-[2px] bg-blue-500 rounded-full animate-pulse"></span>
            )}
          </Link>
        ))}
      </div>

      {/* NOTIFICATIONS (BELL) */}
      <button className="relative p-2 text-gray-400 hover:text-white transition-colors mr-2">
        <FiBell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* PROFILE DROPDOWN */}
      <div className="relative ml-2" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors border border-white/20 shadow-sm"
        >
          <FiUser size={20} />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-[#111827] rounded-xl shadow-2xl border border-white/10 py-2 z-50 origin-top-right animate-fade-in-down">
            <div className="px-4 py-3 border-b border-white/10 mb-1">
              <p className="text-sm text-gray-400 font-medium">Signed in as</p>
              <p className="text-sm font-bold text-white truncate">Administrator</p>
            </div>
            
            <button
              onClick={() => { setProfileOpen(false); navigate("/admin/profile"); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-blue-400 flex items-center gap-2"
            >
              <FiUser /> My Profile
            </button>
            <button
              onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-blue-400 flex items-center gap-2"
            >
              <FiSettings /> Settings
            </button>
            <div className="border-t border-white/10 my-1"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 font-medium flex items-center gap-2"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
