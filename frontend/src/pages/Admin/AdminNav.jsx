import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🔥 Working logout function
  function handleLogout() {
    localStorage.removeItem("adminToken");  // remove token
    navigate("/admin-login");               // redirect to login
  }

  const links = [
    { name: "Dashboard", to: "/admin/dashboard" },
    { name: "Donations", to: "/admin/donations" },
    { name: "Products", to: "/admin/products" },
    { name: "Requests", to: "/admin/requests" },
    { name: "Orphanages", to: "/admin/orphanages" },
    { name: "Disasters", to: "/admin/disasters" },
    { name: "Inventories", to: "/admin/inventories" },
    { name: "Redirect", to: "/admin/redirect" }
  ];

  return (
    <nav className="backdrop-blur-md bg-[#0B1220]/80 shadow-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LEFT: LOGO */}
        <h1 className="text-white text-2xl font-bold tracking-wide">
          Admin Panel
        </h1>

        {/* CENTER: NAV LINKS */}
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative text-sm font-medium transition duration-300 ${
                location.pathname === link.to
                  ? "text-blue-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.name}

              {location.pathname === link.to && (
                <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          ))}
        </div>

        {/* RIGHT: WORKING LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition shadow"
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
}
