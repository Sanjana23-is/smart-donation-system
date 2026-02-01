//frontend/src/pages/AdminProducts.jsx.  
import React, { useEffect, useState } from "react";
import api from "../../api";

export default function AdminProducts() {
  /* ===============================
     STATE MANAGEMENT
  ================================ */
  const [pendingProducts, setPendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null); // approved | rejected
  const [productUnderReview, setProductUnderReview] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");

  /* ===============================
     LIFECYCLE
  ================================ */
  useEffect(() => {
    fetchPendingProducts();
  }, []);

  /* ===============================
     API CALLS
  ================================ */
  async function fetchPendingProducts() {
    try {
      const response = await api.get("/admin/actions/pending-products");
      setPendingProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load pending products", error);
      alert("Unable to load products");
    } finally {
      setIsLoading(false);
    }
  }


  // check what you are passing in the API Body.
  async function submitProductDecision() {
    if (!productUnderReview || !decisionType) return;

    try {
    await api.put(
      `/admin/actions/product/${productUnderReview.productId}/decision`,
      {
        decision: decisionType,
        adminRemark,
      }
    );


      closeDecisionModal();
      await fetchPendingProducts();

      alert(`Product ${decisionType.toUpperCase()}`);
    } catch (error) {
      console.error("Decision submission failed", error);
      alert("Action failed");
    }
  }

  /* ===============================
     UI EVENT HANDLERS
  ================================ */
  function openDecisionModal(type, product) {
    setDecisionType(type);
    setProductUnderReview(product);
    setIsDecisionModalOpen(true);
  }

  function closeDecisionModal() {
    setIsDecisionModalOpen(false);
    setDecisionType(null);
    setProductUnderReview(null);
    setAdminRemark("");
  }

  /* ===============================
     HELPERS
  ================================ */
  function resolveProductImage(image) {
    if (!image) return null;
    try {
      const parsed = JSON.parse(image);
      return Array.isArray(parsed) ? parsed[0] : image;
    } catch {
      return image;
    }
  }

  function getAIStatusColor(status) {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  }

  function getConfidenceBarColor(value) {
    if (value >= 70) return "bg-green-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-red-500";
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">🤖 AI Product Review Panel</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : pendingProducts.length === 0 ? (
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
              {pendingProducts.map((product) => {
                const image = resolveProductImage(product.item_image);
                const confidence = Number.isFinite(Number(product.ai_confidence))
                  ? Math.round(Number(product.ai_confidence))
                  : 50;

                return (
                  <tr
                    key={product.productId}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium">
                      {product.productName}
                    </td>

                    <td className="p-3 capitalize">
                      {product.category || "—"}
                    </td>

                    <td className="p-3">
                      {image ? (
                        <img
                          src={`http://localhost:3000/uploads/${image}`}
                          className="w-14 h-14 rounded-lg object-cover border"
                          alt="product"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getAIStatusColor(
                          product.ai_status
                        )}`}
                      >
                        {product.ai_status || "review"}
                      </span>
                    </td>

                    <td className="p-3 w-40">
                      <div className="text-xs font-semibold mb-1">
                        {confidence}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getConfidenceBarColor(
                            confidence
                          )}`}
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-3 text-xs text-gray-600 max-w-xs">
                      {product.ai_reason || "No AI remarks"}
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                        onClick={() =>
                          openDecisionModal("approved", product)
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                        onClick={() =>
                          openDecisionModal("rejected", product)
                        }
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

      {/* ===============================
          DECISION MODAL (CONFIRMATION)
      ================================ */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">
              Confirm {decisionType}
            </h3>

            <textarea
              className="w-full border rounded p-2 text-sm mb-4"
              placeholder="Admin remark (optional)"
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeDecisionModal}
                className="px-4 py-1 text-sm border rounded"
              >
                Cancel
              </button>

              <button
                onClick={submitProductDecision}
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded"
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