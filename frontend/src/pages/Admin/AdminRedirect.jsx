import React, { useEffect, useState } from "react";
import api from "../../api";
import AdminNav from "./AdminNav";
import {
  FiSend,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiX,
  FiEdit2,
  FiPlus,
  FiEye,
} from "react-icons/fi";

export default function AdminRedirect() {
  const [inventories, setInventories] = useState([]);
  const [orphanages, setOrphanages] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [history, setHistory] = useState([]);

  const [filter, setFilter] = useState("all"); // ⭐ ADDED FILTER STATE

  const [form, setForm] = useState({
    inventoryId: "",
    dispatchToType: "",
    dispatchToId: "",
    dispatchDate: "",
    remarks: "",
  });

  const [selectedInv, setSelectedInv] = useState(null);

  const [markingUid, setMarkingUid] = useState(null);
  const [delivDate, setDelivDate] = useState("");
  const [deliverLocation, setDeliverLocation] = useState("");
  const [deliverRemarks, setDeliverRemarks] = useState("");

  const [editUid, setEditUid] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [isAddMode, setIsAddMode] = useState(false);

  const [timelineModal, setTimelineModal] = useState(false);
  const [timelineRows, setTimelineRows] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [invRes, orphRes, disRes, histRes] = await Promise.all([
        api.get("/inventories"),
        api.get("/orphanages"),
        api.get("/disasters"),
        api.get("/redirect/history/all"),
      ]);

      setInventories(invRes.data || []);
      setOrphanages(orphRes.data || []);
      setDisasters(disRes.data || []);
      setHistory(histRes.data || []);
    } catch {
      alert("Failed to load data");
    }
  }

  function handleInventorySelect(id) {
    setForm({ ...form, inventoryId: id });
    const inv = inventories.find((i) => String(i.inventoryId) === String(id));
    setSelectedInv(inv || null);
  }

  function handleToTypeChange(t) {
    setForm({ ...form, dispatchToType: t, dispatchToId: "" });
  }

  async function saveRedirect() {
    if (!form.inventoryId || !form.dispatchToType || !form.dispatchToId || !form.dispatchDate)
      return alert("Please fill all fields");

    let toName = "";
    if (form.dispatchToType === "orphanage") {
      const o = orphanages.find((x) => x.orphanageId == form.dispatchToId);
      toName = o?.name ?? "Orphanage";
    } else {
      const d = disasters.find((x) => x.disasterId == form.dispatchToId);
      toName = `${d.disasterType} — ${d.location}`;
    }

    const body = {
      inventoryId: selectedInv.inventoryId,
      uid: selectedInv.uid,
      sourceType: selectedInv.sourceType,
      productName:
        selectedInv.productName ||
        selectedInv.requestedItem ||
        (selectedInv.sourceType === "donation"
          ? `Donation Amount: ${selectedInv.amount}`
          : null),
      donationId: selectedInv.donationId,
      disasterRequestId: selectedInv.disasterRequestId,
      toType: form.dispatchToType,
      toName,
      dispatchedBy: "Admin",
      dispatchDate: form.dispatchDate,
      remarks: form.remarks || null,
    };

    try {
      await api.post("/redirect", body);
      alert("Redirect saved");
      loadAll();
      setForm({
        inventoryId: "",
        dispatchToType: "",
        dispatchToId: "",
        dispatchDate: "",
        remarks: "",
      });
      setSelectedInv(null);
    } catch {
      alert("Failed to save redirect");
    }
  }

  function openMarkDelivered(uid) {
    setMarkingUid(uid);
    setDelivDate(new Date().toISOString().slice(0, 10));
  }

  async function confirmDelivered(uid) {
    if (!delivDate) return alert("Pick delivered date");

    try {
      await api.post(`/redirect/${uid}/markdelivered`, {
        deliveredDate: delivDate,
        location: deliverLocation || "Delivered",
        remarks: deliverRemarks || "Completed",
      });

      alert("Delivered updated");
      setMarkingUid(null);
      setDelivDate("");
      setDeliverLocation("");
      setDeliverRemarks("");
      loadAll();
    } catch {
      alert("Failed to mark delivered");
    }
  }

  function openEditModal(row, add = false) {
    setEditUid(row.uid);
    setIsAddMode(add);

    if (add) {
      setEditStatus("");
      setEditLocation("");
      setEditRemarks("");
    } else {
      setEditStatus(row.status || "");
      setEditLocation(row.location || "");
      setEditRemarks(row.remarks || "");
    }
  }

  function closeEditModal() {
    setEditUid(null);
    setEditStatus("");
    setEditLocation("");
    setEditRemarks("");
    setIsAddMode(false);
  }

  async function saveEdit() {
    try {
      await api.put(`/redirect/${editUid}/update`, {
        ...(editStatus ? { status: editStatus } : {}),
        ...(editLocation ? { location: editLocation } : {}),
        remarks: editRemarks ?? null,
      });

      alert("Updated");
      closeEditModal();
      loadAll();
    } catch {
      alert("Failed to update");
    }
  }

  async function saveAddUpdate() {
    if (!editStatus) return alert("Status required");

    try {
      await api.post(`/redirect/${editUid}/addupdate`, {
        status: editStatus,
        location: editLocation,
        remarks: editRemarks,
      });

      alert("Timeline update added");
      closeEditModal();
      loadAll();
    } catch {
      alert("Failed");
    }
  }

  async function openTimeline(uid) {
    try {
      const res = await api.get(`/redirect/${uid}`);
      setTimelineRows(res.data || []);
      setTimelineModal(true);
    } catch {
      alert("Unable to load timeline");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-center mb-10 flex items-center justify-center gap-3">
          <FiTruck className="text-blue-600" /> Redirect Inventory
        </h1>

        {/* CREATE REDIRECT */}
        <div className="bg-white shadow-xl p-6 rounded-2xl border mb-10">
          <h2 className="text-xl font-semibold mb-4">Create Redirect</h2>

          {/* Inventory Dropdown */}
          <label>Select Inventory</label>
          <select
            className="border p-3 rounded w-full mb-2"
            value={form.inventoryId}
            onChange={(e) => handleInventorySelect(e.target.value)}
          >
            <option value="">Choose...</option>
            {inventories.map((i) => (
              <option key={i.inventoryId} value={i.inventoryId}>
                {i.inventoryId} —
                {i.sourceType === "donation"
                  ? `₹${i.amount} (${i.method})`
                  : i.sourceType === "product"
                  ? `${i.productName} (${i.quantity} ${i.unit})`
                  : i.sourceType === "disaster"
                  ? `${i.requestedItem} (${i.quantity} ${i.unit})`
                  : "Item"}
              </option>
            ))}
          </select>

          {selectedInv && (
            <div className="bg-gray-50 p-4 rounded-xl border mb-4 shadow-sm">
              <p>
                <b>UID:</b> {selectedInv.uid}
              </p>
              <p>
                <b>Source Type:</b> {selectedInv.sourceType}
              </p>

              {selectedInv.sourceType === "donation" && (
                <>
                  <p>
                    <b>Donation Amount:</b> ₹{selectedInv.amount}
                  </p>
                  <p>
                    <b>Payment Method:</b> {selectedInv.method}
                  </p>
                </>
              )}

              {selectedInv.sourceType === "product" && (
                <>
                  <p>
                    <b>Item:</b> {selectedInv.productName}
                  </p>
                  <p>
                    <b>Quantity:</b> {selectedInv.quantity} {selectedInv.unit}
                  </p>
                </>
              )}

              {selectedInv.sourceType === "disaster" && (
                <>
                  <p>
                    <b>Requested Item:</b> {selectedInv.requestedItem}
                  </p>
                  <p>
                    <b>Quantity:</b> {selectedInv.quantity} {selectedInv.unit}
                  </p>
                  <p>
                    <b>Request ID:</b> {selectedInv.disasterRequestId}
                  </p>
                </>
              )}
            </div>
          )}

          <label>Redirect To</label>
          <select
            className="border p-3 rounded w-full mb-4"
            value={form.dispatchToType}
            onChange={(e) => handleToTypeChange(e.target.value)}
          >
            <option value="">Choose...</option>
            <option value="orphanage">Orphanage</option>
            <option value="disaster">Disaster</option>
          </select>

          {form.dispatchToType === "orphanage" && (
            <select
              className="border p-3 rounded w-full mb-4"
              value={form.dispatchToId}
              onChange={(e) =>
                setForm({ ...form, dispatchToId: e.target.value })
              }
            >
              <option value="">Select Orphanage</option>
              {orphanages.map((o) => (
                <option key={o.orphanageId} value={o.orphanageId}>
                  {o.name}
                </option>
              ))}
            </select>
          )}

          {form.dispatchToType === "disaster" && (
            <select
              className="border p-3 rounded w-full mb-4"
              value={form.dispatchToId}
              onChange={(e) =>
                setForm({ ...form, dispatchToId: e.target.value })
              }
            >
              <option value="">Select Disaster</option>
              {disasters.map((d) => (
                <option key={d.disasterId} value={d.disasterId}>
                  {d.disasterType} — {d.location}
                </option>
              ))}
            </select>
          )}

          <label>Dispatch Date</label>
          <input
            type="date"
            className="border p-3 rounded w-full mb-4"
            value={form.dispatchDate}
            onChange={(e) =>
              setForm({ ...form, dispatchDate: e.target.value })
            }
          />

          <label>Remarks (optional)</label>
          <input
            className="border p-3 rounded w-full mb-6"
            placeholder="remarks..."
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />

          <button
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl shadow-lg hover:bg-blue-700 transition"
            onClick={saveRedirect}
          >
            <FiSend /> Save Redirect
          </button>
        </div>

        {/* FILTER BUTTONS */}
        <div className="bg-white shadow-xl p-6 rounded-2xl border mb-4">
          <div className="flex gap-3 mb-3">
            <button
              className={`px-4 py-2 rounded ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={`px-4 py-2 rounded ${
                filter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>

            <button
              className={`px-4 py-2 rounded ${
                filter === "delivered"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setFilter("delivered")}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-xl p-6 rounded-2xl border">
          <h2 className="text-2xl font-semibold mb-4">Redirect History</h2>

          <table className="w-full border rounded-xl overflow-hidden shadow-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">UID</th>
                <th className="p-3 border">Item</th>
                <th className="p-3 border">To</th>
                <th className="p-3 border">Dispatch</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Location</th>
                <th className="p-3 border">Delivered</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {history
                .filter((row) => {
                  if (filter === "delivered") return row.deliveredDate;
                  if (filter === "pending") return !row.deliveredDate;
                  return true;
                })
                .map((row) => (
                  <tr key={row.trackId} className="hover:bg-gray-50">
                    <td className="p-2 border">{row.uid}</td>
                    <td className="p-2 border">{row.productName}</td>
                    <td className="p-2 border">{row.toName}</td>
                    <td className="p-2 border">
                      {row.dispatchDate?.slice(0, 10) || "—"}
                    </td>

                    <td className="p-2 border">
                      {row.deliveredDate ? (
                        <span className="text-green-600 inline-flex items-center gap-1">
                          <FiCheckCircle /> Delivered
                        </span>
                      ) : (
                        <span className="text-yellow-600 inline-flex items-center gap-1">
                          <FiClock /> {row.status}
                        </span>
                      )}
                    </td>

                    <td className="p-2 border">
                      {row.location || row.fromLocation || "—"}
                    </td>

                    <td className="p-2 border">
                      {row.deliveredDate
                        ? row.deliveredDate.slice(0, 10)
                        : "Pending"}
                    </td>

                    <td className="p-2 border">
                      <div className="flex flex-col gap-2">
                        <button
                          className="bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-2"
                          onClick={() => openTimeline(row.uid)}
                        >
                          <FiEye /> View
                        </button>

                        <button
                          className="bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-2"
                          onClick={() => openEditModal(row, false)}
                        >
                          <FiEdit2 /> Edit
                        </button>

                        <button
                          className="bg-indigo-600 text-white px-3 py-1 rounded flex items-center gap-2"
                          onClick={() => openEditModal(row, true)}
                        >
                          <FiPlus /> Add
                        </button>

                        {!row.deliveredDate &&
                          (markingUid === row.uid ? (
                            <div>
                              <input
                                type="date"
                                className="border p-1 rounded mb-1"
                                value={delivDate}
                                onChange={(e) => setDelivDate(e.target.value)}
                              />
                              <input
                                className="border p-1 rounded mb-1"
                                placeholder="Location"
                                value={deliverLocation}
                                onChange={(e) =>
                                  setDeliverLocation(e.target.value)
                                }
                              />
                              <input
                                className="border p-1 rounded mb-2"
                                placeholder="Remarks"
                                value={deliverRemarks}
                                onChange={(e) =>
                                  setDeliverRemarks(e.target.value)
                                }
                              />

                              <button
                                className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                                onClick={() => confirmDelivered(row.uid)}
                              >
                                Save
                              </button>
                              <button
                                className="px-3 py-1 border rounded"
                                onClick={() => setMarkingUid(null)}
                              >
                                <FiX />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded"
                              onClick={() => openMarkDelivered(row.uid)}
                            >
                              Mark Delivered
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUid && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-xl">
            <h2 className="font-bold text-xl mb-4">
              {isAddMode ? "Add Timeline Update" : "Edit Latest Update"} — {editUid}
            </h2>

            <label>Status</label>
            <input
              className="border p-2 rounded w-full mb-3"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            />

            <label>Location</label>
            <input
              className="border p-2 rounded w-full mb-3"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />

            <label>Remarks</label>
            <textarea
              className="border p-2 rounded w-full mb-4"
              value={editRemarks}
              onChange={(e) => setEditRemarks(e.target.value)}
            ></textarea>

            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 border rounded" onClick={closeEditModal}>
                Cancel
              </button>

              {isAddMode ? (
                <button
                  className="bg-indigo-600 text-white px-4 py-1 rounded"
                  onClick={saveAddUpdate}
                >
                  Add
                </button>
              ) : (
                <button
                  className="bg-purple-600 text-white px-4 py-1 rounded"
                  onClick={saveEdit}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {timelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-[550px] rounded-2xl max-h-[80vh] overflow-auto shadow-xl">
            <h2 className="font-bold text-xl mb-4">Tracking Timeline</h2>

            {timelineRows.length === 0 ? (
              <p>No history found</p>
            ) : (
              timelineRows.map((x, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <p>
                    <b>Status:</b> {x.status}
                  </p>
                  <p>
                    <b>Location:</b> {x.location || "—"}
                  </p>
                  <p>
                    <b>Remarks:</b> {x.remarks || "—"}
                  </p>

                  {index === 0 && (
                    <p>
                      <b>From → To:</b> {x.fromLocation} → {x.toName}
                    </p>
                  )}

                  {x.dispatchDate && (
                    <p>
                      <b>Dispatch Date:</b> {x.dispatchDate}
                    </p>
                  )}

                  {x.deliveredDate && (
                    <p>
                      <b>Delivered Date:</b> {x.deliveredDate}
                    </p>
                  )}

                  <p className="text-gray-500 text-sm">{x.createdAt}</p>
                </div>
              ))
            )}

            <div className="text-right">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setTimelineModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
