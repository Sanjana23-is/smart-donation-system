import React, { useState } from "react";
import api from "../api";

export default function ItemDonation() {
  const [donorId, setDonorId] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (!image) {
      alert("Please upload an item image");
      return;
    }

    const formData = new FormData();
    formData.append("donorId", donorId);
    formData.append("donationType", "Item");
    formData.append("itemImage", image);

    try {
      setLoading(true);

      await api.post("/donations/with-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Item donation submitted. AI + Admin review pending.");

      setDonorId("");
      setImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit item donation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">
        Donate Items (AI-Assisted Screening)
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          type="text"
          placeholder="Donor ID"
          value={donorId}
          onChange={(e) => setDonorId(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full p-3 border rounded"
          required
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Item Donation"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Uploaded items are screened using AI-assisted image analysis before
        approval.
      </p>
    </div>
  );
}
