import React, { useEffect, useState } from "react";
import api from "../api";
import Barcode from "react-barcode";

export default function Products() {
  const [products, setProducts] = useState([]);
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
    setProducts(res.data);
  }

  async function submit(e) {
    e.preventDefault();

    // simple front-end validation for perishable items
    if (
      form.perishable &&
      (!form.manufactureDate || !form.expiryDate)
    ) {
      alert("Please enter manufacture and expiry dates for perishable products.");
      return;
    }

    await api.post("/donated-products", {
      donorId: form.donorId,
      productName: form.productName,
      category: form.category,
      quantity: form.quantity,
      unit: form.unit,
      perishable: form.perishable,
      manufactureDate: form.perishable ? form.manufactureDate : null,
      expiryDate: form.perishable ? form.expiryDate : null,
    });

    // reset form completely
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

    load();
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      {/* HEADER */}
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        📦 Donated Products
      </h2>

      {/* FORM CONTAINER */}
      <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-lg shadow-xl border border-gray-200 rounded-2xl p-6 mb-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          ➕ Add New Product
        </h3>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <input
            placeholder="Donor ID"
            value={form.donorId}
            onChange={(e) => setForm({ ...form, donorId: e.target.value })}
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-purple-500"
            required
          />

          <input
            placeholder="Product Name"
            value={form.productName}
            onChange={(e) =>
              setForm({ ...form, productName: e.target.value })
            }
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-purple-500"
            required
          />

          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-purple-500"
            required
          />

          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-purple-500"
            required
          />

          <input
            placeholder="Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="p-3 border rounded-lg shadow-sm outline-none focus:border-purple-500"
            required
          />

          {/* Perishable toggle – full row */}
          <div className="col-span-full flex items-center gap-4 mt-2">
            <span className="font-medium text-gray-700">
              Is this product perishable?
            </span>

            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="perishable"
                checked={form.perishable === true}
                onChange={() =>
                  setForm({ ...form, perishable: true })
                }
              />
              <span>Yes</span>
            </label>

            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="perishable"
                checked={form.perishable === false}
                onChange={() =>
                  setForm({
                    ...form,
                    perishable: false,
                    manufactureDate: "",
                    expiryDate: "",
                  })
                }
              />
              <span>No</span>
            </label>
          </div>

          {/* Manufacture + Expiry dates – only when perishable */}
          {form.perishable && (
            <>
              <input
                type="date"
                className="p-3 border rounded-lg shadow-sm outline-none focus:border-purple-500"
                value={form.manufactureDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    manufactureDate: e.target.value,
                  })
                }
                required={form.perishable}
              />

              <input
                type="date"
                className="p-3 border rounded-lg shadow-sm outline-none focus:border-purple-500"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expiryDate: e.target.value,
                  })
                }
                required={form.perishable}
              />
            </>
          )}

          <button className="col-span-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl shadow transition">
            Add Product
          </button>
        </form>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="max-w-6xl mx-auto">
        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
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
                <tr
                  key={p.productId}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3 border">{p.productId}</td>
                  <td className="p-3 border">{p.productName}</td>
                  <td className="p-3 border">{p.category}</td>
                  <td className="p-3 border">{p.quantity}</td>
                  <td className="p-3 border">{p.unit}</td>

                  {/* UID */}
                  <td className="p-3 border font-semibold text-purple-600">
                    {p.uid || "—"}
                  </td>

                  {/* BARCODE */}
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

                  {/* STATUS BADGE */}
                  <td className="p-3 border">
                    <span
                      className={`
                        px-3 py-1 text-sm rounded-full font-semibold
                        ${
                          p.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : p.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
