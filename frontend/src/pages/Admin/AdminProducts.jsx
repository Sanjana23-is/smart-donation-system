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

  function aiColor(status) {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  }

  function confidenceColor(value) {
    if (value >= 70) return "bg-green-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-red-500";
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
      setRemark("");
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
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Image</th>
                <th className="p-3">AI Status</th>
                <th className="p-3">AI Confidence</th>
                <th className="p-3">AI Reason</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const img = getImage(p.item_image);
                const confidence =
                  typeof p.ai_confidence === "number"
                    ? Math.round(p.ai_confidence)
                    : 0;

                return (
                  <tr key={p.productId} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.productName}</td>
                    <td className="p-3 capitalize">{p.category || "—"}</td>

                    <td className="p-3">
                      {img ? (
                        <img
                          src={`http://localhost:3000/uploads/${img}`}
                          className="w-14 h-14 rounded-lg object-cover border"
                          alt="product"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${aiColor(
                          p.ai_status
                        )}`}
                      >
                        {p.ai_status || "review"}
                      </span>
                    </td>

                    {/* AI CONFIDENCE BAR */}
                    <td className="p-3 w-40">
                      <div className="text-xs font-semibold mb-1">
                        {confidence}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${confidenceColor(
                            confidence
                          )}`}
                          style={{ width: `${confidence}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* AI REASON */}
                    <td className="p-3 text-xs text-gray-600 max-w-xs">
                      {p.ai_reason || "No AI remarks"}
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        onClick={() => {
                          setActionType("approved");
                          setSelectedProduct(p);
                          setShowModal(true);
                        }}
                      >
                        Approve
                      </button>

                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-lg font-bold mb-3">
              {actionType === "approved" ? "Approve Product" : "Reject Product"}
            </h2>

            <textarea
              className="w-full border p-2 rounded mb-4 text-sm"
              placeholder="Admin remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className={`px-3 py-1 rounded text-white text-sm ${
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
