import React, { useEffect, useState } from "react";
import api from "../api";
import Barcode from "react-barcode";

const CATEGORY_OPTIONS = [
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food / Groceries" },
  { value: "books", label: "Books" },
  { value: "toys", label: "Toys" },
  { value: "electronics", label: "Electronics" },
  { value: "utensils", label: "Utensils" },
  { value: "medical", label: "Medical Supplies" },
  { value: "others", label: "Others" },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    donorId: "",
    productName: "",
    category: "",
    quantity: "",
    unit: "",
    perishable: false,
    manufactureDate: "",
    expiryDate: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/donated-products");
    setProducts(res.data || []);
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.category) {
      alert("Please select a category.");
      return;
    }

    if (form.perishable && (!form.manufactureDate || !form.expiryDate)) {
      alert("Enter manufacture and expiry dates.");
      return;
    }

    if (images.length === 0) {
      alert("Upload at least 1 product image.");
      return;
    }

    const formData = new FormData();
    formData.append("donorId", form.donorId);
    formData.append("productName", form.productName);
    formData.append("category", form.category);
    formData.append("quantity", form.quantity);
    formData.append("unit", form.unit);
    formData.append("perishable", form.perishable);

    if (form.perishable) {
      formData.append("manufactureDate", form.manufactureDate);
      formData.append("expiryDate", form.expiryDate);
    }

    images.forEach((img) => formData.append("item_images", img));

    try {
      await api.post("/donated-products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product submitted successfully!");

      setForm({
        donorId: "",
        productName: "",
        category: "",
        quantity: "",
        unit: "",
        perishable: false,
        manufactureDate: "",
        expiryDate: "",
      });

      setImages([]);
      load();
    } catch (err) {
      console.error(err);
      alert("Error submitting product.");
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        📦 Donated Products
      </h2>

      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6 mb-10">
        <h3 className="text-xl font-semibold mb-4">➕ Add New Product</h3>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            placeholder="Donor ID"
            value={form.donorId}
            onChange={(e) => setForm({ ...form, donorId: e.target.value })}
            className="p-3 border rounded-lg"
            required
          />

          <input
            placeholder="Product Name"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            className="p-3 border rounded-lg"
            required
          />

          {/* ✅ CATEGORY DROPDOWN (IMPORTANT) */}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-3 border rounded-lg"
            required
          >
            <option value="">Select Category</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="p-3 border rounded-lg"
            required
          />

          <input
            placeholder="Unit (kg, pcs, packets, etc.)"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="p-3 border rounded-lg"
            required
          />

          {/* Perishable */}
          <div className="col-span-full flex gap-4 mt-2">
            <span>Perishable?</span>
            <label>
              <input
                type="radio"
                checked={form.perishable === true}
                onChange={() => setForm({ ...form, perishable: true })}
              />{" "}
              Yes
            </label>
            <label>
              <input
                type="radio"
                checked={form.perishable === false}
                onChange={() =>
                  setForm({
                    ...form,
                    perishable: false,
                    manufactureDate: "",
                    expiryDate: "",
                  })
                }
              />{" "}
              No
            </label>
          </div>

          {form.perishable && (
            <>
              <input
                type="date"
                className="p-3 border rounded-lg"
                value={form.manufactureDate}
                onChange={(e) =>
                  setForm({ ...form, manufactureDate: e.target.value })
                }
                required
              />

              <input
                type="date"
                className="p-3 border rounded-lg"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({ ...form, expiryDate: e.target.value })
                }
                required
              />
            </>
          )}

          {/* Image Upload */}
          <div className="col-span-full">
            <label className="font-medium">Upload Product Images (Max 3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                if (files.length > 3) {
                  alert("Max 3 images allowed.");
                  return;
                }
                setImages(files);
              }}
              className="p-2 border rounded-lg w-full"
            />
            {images.length > 0 && (
              <p className="text-sm mt-1">
                Selected: {images.map((f) => f.name).join(", ")}
              </p>
            )}
          </div>

          <button className="col-span-full bg-purple-600 text-white py-3 rounded-xl">
            Add Product
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl border">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Category</th>
              <th className="p-3 border">Qty</th>
              <th className="p-3 border">Unit</th>
              <th className="p-3 border">UID</th>
              <th className="p-3 border">Barcode</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.productId}>
                <td className="p-3 border">{p.productId}</td>
                <td className="p-3 border">{p.productName}</td>
                <td className="p-3 border">{p.category}</td>
                <td className="p-3 border">{p.quantity}</td>
                <td className="p-3 border">{p.unit}</td>
                <td className="p-3 border">{p.uid || "—"}</td>
                <td className="p-3 border text-center">
                  {p.uid ? (
                    <Barcode
                      value={p.uid}
                      height={40}
                      width={1.2}
                      displayValue={false}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 border">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
