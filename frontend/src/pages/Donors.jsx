import React, { useEffect, useState } from "react";
import api from "../api";

export default function Donors() {
  const [donors, setDonors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get("/donors");
      setDonors(res.data);
    } catch (e) {
      console.error("❌ Error loading donors:", e);
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();

    // --- PHONE VALIDATION: exactly 10 digits ---
    const phone = form.phoneNumber.trim();
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      alert("Phone number must be exactly 10 digits (0–9).");
      return;
    }

    try {
      await api.post("/donors", {
        ...form,
        phoneNumber: phone, // sanitized value
      });

      setForm({ name: "", email: "", phoneNumber: "", address: "" });
      load();
    } catch (e) {
      alert("Error adding donor");
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">

      <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
        🧾 Donor Management
      </h2>

      {/* FORM SECTION */}
      <div className="max-w-5xl mx-auto mb-10 bg-white/70 backdrop-blur-lg shadow-xl border border-gray-200 rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          ➕ Add New Donor
        </h3>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full Name"
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-500"
            required
          />

          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email Address"
            type="email"
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-500"
            required
          />

          <input
            value={form.phoneNumber}
            onChange={(e) => {
              // allow only digits, max 10
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm({ ...form, phoneNumber: value });
            }}
            placeholder="Phone Number"
            type="tel"
            maxLength={10}
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-500"
            required
          />

          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Address"
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-blue-500"
            required
          />

          <button className="col-span-full bg-blue-600 text-white py-3 rounded-xl shadow hover:bg-blue-700 transition">
            Add Donor
          </button>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-600">Loading donors...</p>
        ) : donors.length === 0 ? (
          <p className="text-center text-gray-500">No donors found.</p>
        ) : (
          <div className="overflow-x-auto shadow-xl rounded-2xl bg-white border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 border">ID</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Address</th>
                </tr>
              </thead>

              <tbody>
                {donors.map((d) => (
                  <tr
                    key={d.donorId}
                    className="hover:bg-gray-50 transition border-t"
                  >
                    <td className="p-3 border">{d.donorId}</td>
                    <td className="p-3 border font-medium">{d.name}</td>
                    <td className="p-3 border">{d.email}</td>
                    <td className="p-3 border">{d.phoneNumber}</td>
                    <td className="p-3 border">{d.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
