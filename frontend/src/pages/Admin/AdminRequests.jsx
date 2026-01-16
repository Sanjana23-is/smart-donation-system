import React, { useEffect, useState } from "react";
import api from "../../api";
import { FiSearch, FiCheck, FiX, FiClock } from "react-icons/fi";

export default function AdminRequests() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const ITEMS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/disaster-requests");
      setRows(res.data);
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  }

  async function approve(id) {
    try {
      await api.put(`/disaster-requests/${id}/approve`);
      load();
    } catch (err) {
      alert("Approve failed");
    }
  }

  async function reject(id) {
    try {
      await api.put(`/disaster-requests/${id}/reject`);
      load();
    } catch (err) {
      alert("Reject failed");
    }
  }

  // STATUS BADGE UI
  const statusBadge = (status) => {
    if (status === "approved")
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold flex items-center gap-1">
          <FiCheck /> Approved
        </span>
      );

    if (status === "rejected")
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold flex items-center gap-1">
          <FiX /> Rejected
        </span>
      );

    return (
      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold flex items-center gap-1">
        <FiClock /> Pending
      </span>
    );
  };

  // STATUS DERIVED
  function getStatus(r) {
    return r.status || (r.fulfilled === 0 ? "pending" : r.fulfilled === 1 ? "approved" : "rejected");
  }

  // SEARCH + FILTER
  const filtered = rows.filter((r) => {
    const status = getStatus(r);

    return (
      (statusFilter === "all" || status === statusFilter) &&
      (r.requestedItem.toLowerCase().includes(search.toLowerCase()) ||
        r.disasterName?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // PAGINATION
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🌪 Manage Disaster Requests
      </h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        
        {/* SEARCH */}
        <div className="flex items-center bg-white p-2 rounded-lg shadow border w-full md:w-1/3 gap-2">
          <FiSearch className="text-gray-600" />
          <input
            type="text"
            placeholder="Search by disaster or item…"
            className="outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTER DROPDOWN */}
        <select
          className="p-2 bg-white rounded-lg shadow border"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700 text-sm font-semibold">
              <th className="p-4">ID</th>
              <th className="p-4">Disaster</th>
              <th className="p-4">Item</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((r) => {
              const status = getStatus(r);
              return (
                <tr key={r.requestId} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">{r.requestId}</td>
                  <td className="p-4">{r.disasterName || "—"}</td>
                  <td className="p-4">{r.requestedItem}</td>
                  <td className="p-4">{r.quantity}</td>
                  <td className="p-4">{r.unit}</td>
                  <td className="p-4">{statusBadge(status)}</td>

                  <td className="p-4">
                    {status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                          onClick={() => approve(r.requestId)}
                        >
                          <FiCheck /> Approve
                        </button>

                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                          onClick={() => reject(r.requestId)}
                        >
                          <FiX /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No actions</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-40"
        >
          Prev
        </button>

        <span className="font-semibold">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
