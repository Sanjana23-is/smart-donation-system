import React, { useEffect, useState } from "react";
import api from "../../api";

import { FiSearch, FiCheck, FiX, FiClock } from "react-icons/fi";

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const ITEMS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadDonations();
  }, []);

  async function loadDonations() {
    const res = await api.get("/donations");
    setDonations(res.data);
  }

  async function approve(id) {
    await api.put(`/admin/actions/approve-donation/${id}`);
    loadDonations();
  }

  async function reject(id) {
    await api.put(`/admin/actions/reject-donation/${id}`);
    loadDonations();
  }

  // Status badge UI
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

  // SEARCH + FILTER
  const filtered = donations.filter((d) => {
    return (
      (statusFilter === "all" || d.status === statusFilter) &&
      (d.method.toLowerCase().includes(search.toLowerCase()) ||
        String(d.amount).includes(search) ||
        String(d.donorId).includes(search))
    );
  });

  // PAGINATION
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💰 Manage Donations</h1>

      {/* SEARCH + FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        {/* SEARCH */}
        <div className="flex items-center gap-2 bg-white shadow p-2 rounded-lg w-full md:w-1/3 border">
          <FiSearch className="text-gray-600" />
          <input
            type="text"
            placeholder="Search by donor, method, amount…"
            className="w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTER */}
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
              <th className="p-4">Donor</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((d) => (
              <tr key={d.donationId} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">{d.donationId}</td>
                <td className="p-4">{d.donorId}</td>
                <td className="p-4">{d.donationDate?.slice(0, 10)}</td>
                <td className="p-4 font-semibold text-blue-600">₹{d.amount}</td>
                <td className="p-4 capitalize">{d.method}</td>
                <td className="p-4">{statusBadge(d.status)}</td>

                <td className="p-4">
                  {d.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(d.donationId)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg shadow transition flex items-center gap-1"
                      >
                        <FiCheck /> Approve
                      </button>

                      <button
                        onClick={() => reject(d.donationId)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow transition flex items-center gap-1"
                      >
                        <FiX /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No actions</span>
                  )}
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No donations found.
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

        <span className="font-semibold">{page} / {totalPages}</span>

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
