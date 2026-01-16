import React, { useEffect, useState } from "react";
import api from "../api";
import { FiSearch, FiAlertTriangle, FiCheckCircle, FiMapPin, FiCalendar } from "react-icons/fi";

export default function Disasters() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/disasters");
    setRows(res.data);
  }

  const filtered = rows
    .filter((d) => {
      const q = search.toLowerCase();
      const matchText =
        d.disasterType.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q);

      const matchStatus =
        filterStatus === "all" ? true : d.status === filterStatus;

      return matchText && matchStatus;
    })
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-gray-200">

      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800 drop-shadow-sm">
        🌍 Active Disasters
      </h2>

      {/* SEARCH + FILTER BAR */}
      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg shadow-lg p-4 rounded-xl border flex flex-col md:flex-row gap-4 mb-8">

        {/* Search bar */}
        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-full">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search disaster or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded-lg shadow-sm"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
        </select>

      </div>

      {/* DISASTER CARDS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {filtered.map((d) => (
          <div
            key={d.disasterId}
            className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border hover:shadow-2xl transform hover:-translate-y-1 transition"
          >
            {/* Badge + Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-red-100 text-red-700">
                <FiAlertTriangle size={26} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {d.disasterType}
              </h3>
            </div>

            {/* Location */}
            <p className="text-gray-700 flex items-center gap-2 mt-2">
              <FiMapPin className="text-blue-600" /> 
              <span className="font-medium">{d.location}</span>
            </p>

            {/* Date */}
            <p className="text-gray-700 flex items-center gap-2 mt-1">
              <FiCalendar className="text-purple-600" /> 
              {d.date}
            </p>

            {/* Status Badge */}
            <div className="mt-4">
              {d.status === "active" ? (
                <span className="px-4 py-1 rounded-full bg-red-100 text-red-700 font-semibold flex items-center gap-1 w-fit">
                  <FiAlertTriangle /> Active
                </span>
              ) : (
                <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1 w-fit">
                  <FiCheckCircle /> Resolved
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-600 col-span-full text-lg">
            No disasters found 📭
          </p>
        )}
      </div>
    </div>
  );
}
