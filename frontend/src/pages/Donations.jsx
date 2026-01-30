import React, { useEffect, useState } from "react";
import api from "../api";

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState({
    donorId: "",
    amount: "",
    method: "",
    paymentReference: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/donations");
      setDonations(res.data || []);
    } catch (e) {
      console.error("❌ Error loading donations:", e);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/donations", {
        donorId: form.donorId,
        amount: form.amount,
        method: form.method,
        donationType: "money",
        paymentReference: form.method === "UPI" ? form.paymentReference : null,
      });

      setForm({
        donorId: "",
        amount: "",
        method: "",
        paymentReference: "",
      });

      load();
      alert("Donation Submitted. Awaiting Admin Approval.");
    } catch (e) {
      console.error(e);
      alert("Error adding donation");
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        💰 Money Donation
      </h2>

      {/* FORM */}
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-xl mb-10">
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            placeholder="Donor ID"
            value={form.donorId}
            onChange={(e) => setForm({ ...form, donorId: e.target.value })}
            className="p-3 border rounded-lg shadow-sm"
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="p-3 border rounded-lg shadow-sm"
            required
          />

          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            className="p-3 border rounded-lg shadow-sm"
            required
          >
            <option value="">Select Method</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>

          {form.method === "UPI" && (
            <input
              placeholder="Enter UPI Transaction ID"
              value={form.paymentReference}
              onChange={(e) =>
                setForm({ ...form, paymentReference: e.target.value })
              }
              className="p-3 border rounded-lg shadow-sm col-span-full"
              required
            />
          )}

          {form.method === "UPI" && (
            <div className="col-span-full flex flex-col items-center mt-4">
              <p className="text-gray-700 mb-2 font-semibold">
                Scan & Pay (UPI)
              </p>

              <img
                src="/upi-qr.jpeg"
                alt="UPI QR"
                className="w-40 h-40 object-contain"
              />

              <p className="text-gray-600 mt-3">
                UPI ID: <b>sathvikshettu837@okicici</b>
              </p>
            </div>
          )}

          <button className="col-span-full bg-green-600 text-white py-3 rounded-xl shadow hover:bg-green-700 transition">
            Submit Donation
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div className="max-w-6xl mx-auto">
        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Donor ID</th>
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Method</th>
                <th className="p-3 border">Payment Ref</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">UID</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((d) => (
                <tr key={d.donationId} className="hover:bg-gray-50 transition">
                  <td className="p-3 border">{d.donationId}</td>
                  <td className="p-3 border">{d.donorId}</td>
                  <td className="p-3 border font-semibold">
                    ₹{d.amount || 0}
                  </td>
                  <td className="p-3 border">{d.method || "—"}</td>
                  <td className="p-3 border font-mono text-sm">
                    {d.paymentReference || "—"}
                  </td>
                  <td className="p-3 border">
                    <span
                      className={`
                        px-3 py-1 text-sm rounded-full font-semibold
                        ${
                          d.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : d.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 border">{d.uid}</td>
                </tr>
              ))}

              {donations.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    No donations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
