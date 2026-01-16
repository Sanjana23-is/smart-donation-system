import React, { useEffect, useState } from "react";
import api from "../../api";
import { FiSearch, FiCheck, FiX, FiClock } from "react-icons/fi";

export default function AdminProducts() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const ITEMS_PER_PAGE = 8;
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/donated-products");
    setList(res.data);
  }

  async function approve(id) {
    await api.put(`/donated-products/${id}/approve`);
    load();
  }

  async function reject(id) {
    await api.put(`/donated-products/${id}/reject`);
    load();
  }

  // FORMAT DATE TO dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return "—";

    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const perishableText = (val) => (val ? "Yes" : "No");

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

  // FILTER + SEARCH
  const filtered = list.filter((p) => {
    return (
      (statusFilter === "all" || p.status === statusFilter) &&
      (p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()))
    );
  });

  // PAGINATION
  const start = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📦 Manage Product Donations
      </h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white shadow p-2 rounded-lg w-full md:w-1/3 border">
          <FiSearch className="text-gray-600" />
          <input
            type="text"
            placeholder="Search product or category…"
            className="w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Perishable</th>
              <th className="p-4">Mfg Date</th>
              <th className="p-4">Expiry Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((p) => (
              <tr key={p.productId} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{p.productName}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">{p.quantity}</td>
                <td className="p-4">{p.unit}</td>

                {/* NEW COLUMNS: READ ONLY */}
                <td className="p-4">{perishableText(p.perishable)}</td>
                <td className="p-4">{formatDate(p.manufactureDate)}</td>
                <td className="p-4">{formatDate(p.expiryDate)}</td>

                <td className="p-4">{statusBadge(p.status)}</td>

                <td className="p-4">
                  {p.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(p.productId)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg shadow transition flex items-center gap-1"
                      >
                        <FiCheck /> Approve
                      </button>

                      <button
                        onClick={() => reject(p.productId)}
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
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  No products found.
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
