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
    loadDonors();
  }, []);

  async function loadDonors() {
    try {
      const res = await api.get("/donors");
      console.log("API RESPONSE:", res.data);   // 👈 ADD THIS LINE
      setDonors(res.data);

    } catch (err) {
      console.error("❌ Failed to load donors:", err);
      alert("Failed to load donors (backend error)");
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();

    const phone = form.phoneNumber.trim();
    if (!/^[0-9]{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      await api.post("/donors", {
        ...form,
        phoneNumber: phone,
      });

      alert("✅ Donor added successfully");

      setForm({ name: "", email: "", phoneNumber: "", address: "" });
      loadDonors();
    } catch (err) {
      console.error("❌ Add donor error:", err);
      alert(err.response?.data?.error || "Error adding donor");
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8">🧾 Donor Management</h2>

      <div className="max-w-5xl mx-auto mb-10 bg-white shadow-xl rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">➕ Add New Donor</h3>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full Name"
            className="p-3 border rounded-lg"
            required
          />

          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            type="email"
            className="p-3 border rounded-lg"
            required
          />

          <input
            value={form.phoneNumber}
            onChange={(e) =>
              setForm({
                ...form,
                phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            placeholder="Phone Number"
            className="p-3 border rounded-lg"
            required
          />

          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Address"
            className="p-3 border rounded-lg"
            required
          />

          <button className="col-span-full bg-blue-600 text-white py-3 rounded-xl">
            Add Donor
          </button>
        </form>
      </div>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <p>Loading donors...</p>
        ) : donors.length === 0 ? (
          <p>No donors found.</p>
        ) : (
          <table className="w-full bg-white shadow-xl rounded-xl overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Address</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d) => (
                <tr key={d.donorId} className="border-t">
                  <td className="p-3">{d.donorId}</td>
                  <td className="p-3">{d.name}</td>
                  <td className="p-3">{d.email}</td>
                  <td className="p-3">{d.phoneNumber}</td>
                  <td className="p-3">{d.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
