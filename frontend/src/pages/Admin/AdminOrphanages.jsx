import React, { useEffect, useState } from "react";
import api from "../../api";
import { FiSearch, FiHome, FiPlusCircle, FiUsers } from "react-icons/fi";

export default function AdminOrphanages() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    location: "",
    contactPerson: "",
  });

  // Pagination
  const ITEMS_PER_PAGE = 6;
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/orphanages");
      setRows(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/orphanages", form);
      alert("Orphanage added!");
      setForm({ name: "", location: "", contactPerson: "" });
      load();
    } catch {
      alert("Error adding orphanage");
    }
  }

  const filtered = rows.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase())
  );

  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">

      {/* PAGE HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 flex items-center justify-center gap-3">
          <FiUsers className="text-blue-600" /> Manage Orphanages
        </h1>
        <p className="text-gray-600 mt-2">
          Add & manage orphanages registered under the donation system
        </p>
      </div>

      {/* FORM CARD */}
      <div className="bg-white/90 backdrop-blur-md shadow-xl border rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiPlusCircle /> Add New Orphanage
        </h2>

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Orphanage Name"
            className="p-3 border rounded-xl shadow-sm focus:border-blue-500 outline-none"
            required
          />

          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location"
            className="p-3 border rounded-xl shadow-sm focus:border-blue-500 outline-none"
            required
          />

          <input
            value={form.contactPerson}
            onChange={(e) =>
              setForm({ ...form, contactPerson: e.target.value })
            }
            placeholder="Contact Person"
            className="p-3 border rounded-xl shadow-sm focus:border-blue-500 outline-none"
            required
          />

          <button className="bg-gradient-to-br from-green-500 to-green-600 text-white py-3 rounded-xl shadow hover:from-green-600 hover:to-green-700 transition md:col-span-3">
            Add Orphanage
          </button>
        </form>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-2 bg-white shadow p-3 rounded-xl border mb-6 max-w-md">
        <FiSearch className="text-gray-600" />
        <input
          type="text"
          placeholder="Search orphanage or location..."
          className="outline-none w-full"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* ORPHANAGE CARDS GRID */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((o) => (
          <div
            key={o.orphanageId}
            className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-blue-100 text-blue-700 rounded-2xl shadow-inner">
                <FiHome size={26} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">{o.name}</h3>
            </div>

            <p className="text-gray-700 mb-1">
              <b className="text-gray-800">📍 Location:</b> {o.location}
            </p>
            <p className="text-gray-700">
              <b className="text-gray-800">👤 Contact:</b> {o.contactPerson}
            </p>
          </div>
        ))}

        {paginated.length === 0 && (
          <p className="text-gray-500 text-center col-span-full">
            No orphanages found.
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
