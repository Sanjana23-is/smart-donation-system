import React, { useEffect, useState } from "react";
import api from "../../api";
import { FiSearch, FiAlertTriangle, FiPlusCircle, FiCheckCircle } from "react-icons/fi";

export default function AdminDisasters() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    disasterType: "",
    location: "",
    date: "",
  });

  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/disasters");
      setRows(res.data);
    } catch (err) {
      console.error("Error loading disasters:", err);
    }
  }

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/disasters", form);
      alert("Disaster added!");
      setForm({ disasterType: "", location: "", date: "" });
      load();
    } catch {
      alert("Failed to add");
    }
  }

  async function resolveDisaster(id) {
    try {
      await api.put(`/disasters/${id}/status`, { status: "resolved" });
      load();
    } catch {
      alert("Failed to update");
    }
  }

  const filtered = rows.filter(
    (d) =>
      d.disasterType.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase())
  );

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const statusBadge = (status) => {
    if (status === "active")
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold flex items-center gap-1">
          <FiAlertTriangle /> Active
        </span>
      );

    return (
      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1">
        <FiCheckCircle /> Resolved
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 flex items-center justify-center gap-3">
          🌍 Disaster Management
        </h1>
        <p className="text-gray-600 mt-2">
          Add & monitor disaster events, track relief status, resolve emergencies.
        </p>
      </div>

      {/* ADD FORM */}
      <div className="bg-white/90 shadow-xl border rounded-2xl p-6 mb-10 backdrop-blur-md">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiPlusCircle /> Add New Disaster
        </h2>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
          <input
            value={form.disasterType}
            onChange={(e) => setForm({ ...form, disasterType: e.target.value })}
            placeholder="Disaster Type (Flood, Earthquake...)"
            className="p-3 border rounded-xl shadow-sm outline-none focus:border-blue-500"
            required
          />

          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location"
            className="p-3 border rounded-xl shadow-sm outline-none focus:border-blue-500"
            required
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="p-3 border rounded-xl shadow-sm outline-none focus:border-blue-500"
            required
          />

          <button className="bg-gradient-to-br from-green-500 to-green-600 text-white py-3 rounded-xl shadow hover:from-green-600 hover:to-green-700 transition md:col-span-3">
            Add Disaster
          </button>
        </form>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 bg-white shadow p-3 rounded-xl border mb-8 max-w-md">
        <FiSearch className="text-gray-600" />
        <input
          type="text"
          placeholder="Search disaster or location..."
          className="outline-none w-full"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* CARDS GRID */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((d) => (
          <div
            key={d.disasterId}
            className="bg-white/90 p-6 rounded-2xl shadow-xl border hover:shadow-2xl transition transform hover:-translate-y-1 backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-red-100 text-red-700 rounded-2xl shadow-inner">
                <FiAlertTriangle size={26} />
              </div>
              <h3 className="text-2xl font-semibold">{d.disasterType}</h3>
            </div>

            <p className="text-gray-700 mb-1">
              <b>📍 Location:</b> {d.location}
            </p>
            <p className="text-gray-700">
              <b>📅 Date:</b> {d.date}
            </p>

            <div className="mt-4">{statusBadge(d.status)}</div>

            <div className="mt-5">
              {d.status === "active" ? (
                <button
                  className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-full py-2 rounded-xl shadow hover:from-blue-700 hover:to-blue-800 transition"
                  onClick={() => resolveDisaster(d.disasterId)}
                >
                  Mark as Resolved
                </button>
              ) : (
                <button className="bg-gray-300 text-gray-600 w-full py-2 rounded-xl cursor-not-allowed">
                  Already Resolved
                </button>
              )}
            </div>
          </div>
        ))}

        {paginated.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">
            No disasters found.
          </p>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-6 mt-10">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-5 py-2 rounded-xl shadow ${
            page === 1
              ? "bg-gray-300 opacity-40"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          Prev
        </button>

        <span className="font-semibold text-gray-700">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-5 py-2 rounded-xl shadow ${
            page === totalPages
              ? "bg-gray-300 opacity-40"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
