import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [pending, setPending] = useState({
    donations: [],
    products: [],
    orphanages: [],
    requests: [],
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const donations = await api.get("/donations");
      const products = await api.get("/donated-products");
      const orphanages = await api.get("/orphanages");
      const requests = await api.get("/disaster-requests");

      setPending({
        donations: donations.data.filter((d) => d.status === "pending"),
        products: products.data.filter((p) => p.status === "pending"),
        orphanages: orphanages.data.filter((o) => o.status === "pending"),
        requests: requests.data.filter((r) => r.status === "pending"),
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function approve(type, id) {
    await api.put(`/admin/actions/approve`, { type, id });
    loadAll();
  }

  async function reject(type, id) {
    await api.put(`/admin/actions/reject`, { type, id });
    loadAll();
  }

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6 text-center text-yellow-600">
        Admin Control Panel
      </h1>

      {/* Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Pending Donations" count={pending.donations.length} color="blue" />
        <SummaryCard label="Pending Products" count={pending.products.length} color="purple" />
        <SummaryCard label="Orphanage Approvals" count={pending.orphanages.length} color="green" />
        <SummaryCard label="Disaster Requests" count={pending.requests.length} color="red" />
      </div>

      {/* Approval Sections */}
      <Section title="Pending Donations" data={pending.donations} type="donation" approve={approve} reject={reject} />
      <Section title="Pending Donated Products" data={pending.products} type="product" approve={approve} reject={reject} />
      <Section title="Orphanage Approvals" data={pending.orphanages} type="orphanage" approve={approve} reject={reject} />
      <Section title="Disaster Requests" data={pending.requests} type="request" approve={approve} reject={reject} />
    </div>
  );
}

/* Summary Card */
function SummaryCard({ label, count, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className={`p-6 rounded-xl shadow ${colors[color]} text-center`}>
      <h2 className="text-xl font-bold">{label}</h2>
      <p className="text-3xl font-extrabold mt-2">{count}</p>
    </div>
  );
}

/* Approval Section */
function Section({ title, data, type, approve, reject }) {
  if (data.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      <div className="bg-white shadow rounded-lg">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Details</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-semibold">{item.id || item.donationId || item.productId || item.orphanageId}</td>
                <td className="p-3">{JSON.stringify(item)}</td>

                <td className="p-3 flex gap-2">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => approve(type, item.id || item.donationId || item.productId || item.orphanageId)}
                  >
                    Approve
                  </button>

                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={() => reject(type, item.id || item.donationId || item.productId || item.orphanageId)}
                  >
                    Reject
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
