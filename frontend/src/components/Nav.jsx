import React from "react";

export default function Nav({ current, setCurrent }) {
  const items = [
    "Dashboard",
    "Donors",
    "Donations",
    "Products",
    
    "RequestDisaster",
    "Disasters",
    "Orphanages",
    "Track",
  ];

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/login";
  }

  return (
    <nav className="backdrop-blur-md bg-white/80 shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center p-4 gap-8">

        {/* LEFT LOGO / TITLE */}
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
          Donation Tracker
        </h1>

        {/* MENU ITEMS */}
        <div className="flex gap-4">
          {items.map((i) => {
            const label = i === "RequestDisaster" ? "Disaster Requests" : i;

            const active = current === i;

            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative px-3 py-1.5 font-medium transition-all duration-300
                  ${
                    active
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {label}

                {/* Active underline */}
                {active && (
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-blue-600 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT SIDE LOGOUT */}
        <button
          onClick={handleLogout}
          className="ml-auto px-4 py-1.5 bg-red-600 text-white rounded-lg shadow 
                     hover:bg-red-700 transition-all duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
