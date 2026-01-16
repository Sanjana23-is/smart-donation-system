import React, { useEffect, useState } from "react";
import api from "../api";
import { FiSearch, FiHome, FiMapPin, FiUser } from "react-icons/fi";

export default function Orphanages() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/orphanages");
    setRows(res.data);
  }

  // extract unique locations
  const locations = ["all", ...new Set(rows.map((o) => o.location))];

  // filtering + sorting
  const filtered = rows
    .filter((o) => {
      const q = search.toLowerCase();
      const matchText =
        o.name.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q);

      const matchLocation =
        locationFilter === "all" ? true : o.location === locationFilter;

      return matchText && matchLocation;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-200">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800 drop-shadow">
        🏠 Orphanages
      </h2>

      {/* SEARCH + FILTER BAR */}
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg shadow-lg p-4 rounded-xl border flex flex-col md:flex-row gap-4 mb-8">

        {/* Search */}
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search orphanage or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full"
          />
        </div>

        {/* Location Filter */}
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc === "all" ? "All Locations" : loc}
            </option>
          ))}
        </select>

        {/* Sorting */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="asc">Sort: A → Z</option>
          <option value="desc">Sort: Z → A</option>
        </select>
      </div>

      {/* ORPHANAGE CARDS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {filtered.map((o) => (
          <div
            key={o.orphanageId}
            className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border hover:shadow-2xl transform hover:-translate-y-1 transition"
          >
            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <FiHome size={26} />
              </div>

              <h3 className="text-xl font-bold text-gray-800">{o.name}</h3>
            </div>

            {/* Location */}
            <p className="text-gray-700 flex items-center gap-2 mt-1">
              <FiMapPin className="text-red-600" /> {o.location}
            </p>

            {/* Contact */}
            <p className="text-gray-700 flex items-center gap-2 mt-1">
              <FiUser className="text-green-700" /> {o.contactPerson}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 col-span-full text-lg">
            No orphanages found 📭
          </p>
        )}
      </div>
    </div>
  );
}
