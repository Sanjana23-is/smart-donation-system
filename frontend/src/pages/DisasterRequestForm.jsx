import React, { useEffect, useState } from "react";
import api from "../api";
import Barcode from "react-barcode";

export default function DisasterRequestForm() {
  const [disasters, setDisasters] = useState([]);
  const [requests, setRequests] = useState([]);

  const [form, setForm] = useState({
    disasterId: "",
    requestedItem: "",
    quantity: "",
    unit: "",
  });

  useEffect(() => {
    loadDisasters();
    loadRequests();
  }, []);

  async function loadDisasters() {
    try {
      const res = await api.get("/disasters");
      setDisasters(res.data);
    } catch (err) {
      console.error("Error loading disasters:", err);
    }
  }

  async function loadRequests() {
    try {
      const res = await api.get("/disaster-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  }

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/disaster-requests", form);
      alert("Request submitted successfully!");

      setForm({ disasterId: "", requestedItem: "", quantity: "", unit: "" });
      loadRequests();
    } catch (err) {
      alert("Failed to submit request");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        🚨 Disaster Donation Request
      </h2>

      {/* FORM CARD */}
      <div className="bg-white/70 backdrop-blur-md shadow-xl border border-gray-200 rounded-2xl p-6 mb-10">
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          
          <select
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-600"
            value={form.disasterId}
            onChange={(e) => setForm({ ...form, disasterId: e.target.value })}
            required
          >
            <option value="">Select Disaster</option>
            {disasters.map((d) => (
              <option key={d.disasterId} value={d.disasterId}>
                {d.disasterType} — {d.location}
              </option>
            ))}
          </select>

          <input
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-600"
            placeholder="Item name"
            value={form.requestedItem}
            onChange={(e) => setForm({ ...form, requestedItem: e.target.value })}
            required
          />

          <input
            type="number"
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-600"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />

          <input
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-600"
            placeholder="Unit (kg, box, litres…)"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            required
          />

          <button className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition text-lg font-semibold">
            Submit Request
          </button>
        </form>
      </div>

      {/* REQUEST LIST */}
      <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
        📋 Your Requests
      </h3>

      {!requests.length ? (
        <p className="text-gray-500 text-center">No requests submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white/70 backdrop-blur-md border rounded-xl shadow-lg">
            <thead className="bg-gray-100/80">
              <tr>
                <th className="p-3 border">Disaster</th>
                <th className="p-3 border">Item</th>
                <th className="p-3 border">Qty</th>
                <th className="p-3 border">Unit</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">UID</th>
                <th className="p-3 border">Barcode</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((r) => (
                <tr
                  key={r.requestId}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 border">{r.disasterName}</td>
                  <td className="p-3 border">{r.requestedItem}</td>
                  <td className="p-3 border">{r.quantity}</td>
                  <td className="p-3 border">{r.unit}</td>

                  {/* STATUS BADGE */}
                  <td className="p-3 border text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold 
                    ${
                      r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  {/* UID */}
                  <td className="p-3 border text-center">
                    {r.uid ? r.uid : "—"}
                  </td>

                  {/* BARCODE */}
                  <td className="p-3 border text-center">
                    {r.uid ? (
                      <Barcode
                        value={r.uid}
                        height={40}
                        width={1}
                        displayValue={false}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
