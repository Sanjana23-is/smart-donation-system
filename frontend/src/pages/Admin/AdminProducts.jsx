import React, { useEffect, useState } from "react";
import api from "../../api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await api.get("/admin/actions/pending-products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("❌ Load products error:", err);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  function getImage(img) {
    if (!img) return null;
    try {
      const parsed = JSON.parse(img);
      return Array.isArray(parsed) ? parsed[0] : null;
    } catch {
      return img;
    }
  }

  async function handleDecision() {
    try {
      await api.put(
        `/admin/actions/product/${selectedProduct.productId}/decision`,
        {
          decision: actionType,
          adminRemark: remark,
        }
      );

      alert(`Product ${actionType}`);
      setShowModal(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">🤖 AI Product Review Panel</h2>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No pending products.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Image</th>
                <th className="p-3">AI Status</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const img = getImage(p.item_image);

                return (
                  <tr key={p.productId} className="border-t">
                    <td className="p-3">{p.productName}</td>
                    <td className="p-3">{p.category || "—"}</td>

                    <td className="p-3">
                      {img ? (
                        <img
                          src={`http://localhost:3000/uploads/${img}`}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                        {p.ai_status}
                      </span>
                    </td>

                    <td className="p-3 font-semibold">
                      {p.ai_confidence
                        ? Math.round(p.ai_confidence * 100) + "%"
                        : "0%"}
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setActionType("approved");
                          setSelectedProduct(p);
                          setShowModal(true);
                        }}
                      >
                        Approve
                      </button>

                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => {
                          setActionType("rejected");
                          setSelectedProduct(p);
                          setShowModal(true);
                        }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-lg font-bold mb-3">
              {actionType === "approved" ? "Approve Product" : "Reject Product"}
            </h2>

            <textarea
              className="w-full border p-2 rounded mb-4"
              placeholder="Admin remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-400 text-white rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className={`px-3 py-1 rounded text-white ${
                  actionType === "approved" ? "bg-green-600" : "bg-red-600"
                }`}
                onClick={handleDecision}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
