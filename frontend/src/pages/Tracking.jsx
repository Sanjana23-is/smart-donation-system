import React, { useEffect, useState } from "react";
import { useZxing } from "react-zxing";
import api from "../api";

import {
  FiSearch,
  FiCamera,
  FiCameraOff,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiHash,
  FiPackage,
} from "react-icons/fi";

export default function Tracking() {
  const [uid, setUid] = useState("");
  const [history, setHistory] = useState([]);
  const [openScanner, setOpenScanner] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      const code = result.getText();
      setUid(code);
      closeCamera();
      search(code);
    },
  });

  // ---------- helper: format date as DD/MM/YYYY ----------
  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d)) {
      // fallback if backend already sends string; use first 10 chars
      return value.slice(0, 10).split("-").reverse().join("/");
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    async function loadDevices() {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const cams = list.filter((d) => d.kind === "videoinput");
        setDevices(cams);
        if (cams.length > 0) {
          setSelectedDeviceId(cams[cams.length - 1].deviceId);
        }
      } catch (e) {}
    }
    loadDevices();
  }, []);

  useEffect(() => {
    if (!openScanner) return;

    async function startCamera() {
      setCameraError(null);
      try {
        const constraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: "environment" },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (ref.current) {
          ref.current.srcObject = stream;
          ref.current.setAttribute("playsinline", "");
          ref.current.muted = true;
          await ref.current.play();
        }
      } catch (err) {
        setCameraError("Unable to access camera");
      }
    }

    startCamera();
    return () => closeCamera();
  }, [openScanner, selectedDeviceId, ref]);

  const closeCamera = () => {
    if (ref.current && ref.current.srcObject) {
      ref.current.srcObject.getTracks().forEach((t) => t.stop());
      ref.current.srcObject = null;
    }
    setOpenScanner(false);
  };

  async function search(u = uid) {
    if (!u) return alert("Enter UID");

    try {
      const res = await api.get(`/redirect/${u}`);
      setHistory(res.data || []);
    } catch (err) {
      alert("UID not found");
      setHistory([]);
    }
  }

  const statusIcon = (status) => {
    if (status === "Delivered")
      return <FiCheckCircle className="text-green-600" size={24} />;
    if (status === "Dispatched")
      return <FiTruck className="text-blue-600" size={24} />;
    return <FiClock className="text-yellow-600" size={24} />;
  };

  const hasHistory = history && history.length > 0;
  const first = hasHistory ? history[0] : null;
  const last = hasHistory ? history[history.length - 1] : null;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* HEADER */}
      <h2 className="text-5xl font-extrabold text-center mb-10 text-gray-800 flex justify-center items-center gap-3">
        <FiPackage className="text-purple-600" />
        Track Your Donation
      </h2>

      {/* MAIN CARD */}
      <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-xl shadow-2xl p-8 rounded-3xl border border-white/40">
        {/* SCAN BUTTON */}
        <button
          className={`w-full flex items-center justify-center gap-2 p-4 text-white rounded-xl shadow-lg text-lg font-semibold transition ${
            openScanner
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={() => {
            if (openScanner) closeCamera();
            else setOpenScanner(true);
          }}
        >
          {openScanner ? <FiCameraOff size={24} /> : <FiCamera size={24} />}
          {openScanner ? "Close Camera" : "Scan Barcode"}
        </button>

        {/* CAMERA VIEW */}
        {openScanner && (
          <div className="mt-5">
            {devices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="p-3 border rounded-xl mb-3 w-full bg-white shadow-sm"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || "Camera"}
                  </option>
                ))}
              </select>
            )}

            <video
              ref={ref}
              className="w-full rounded-xl border-2 border-gray-300 shadow-xl bg-black"
              style={{ height: 350, objectFit: "cover" }}
              playsInline
              muted
              autoPlay
            />
            {cameraError && <p className="text-red-600 mt-2">{cameraError}</p>}
          </div>
        )}

        {/* SEARCH BOX */}
        <div className="flex gap-3 mt-8">
          <input
            className="p-4 border rounded-xl w-full shadow-md text-lg"
            placeholder="Enter UID manually..."
            value={uid}
            onChange={(e) => setUid(e.target.value)}
          />

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl shadow-lg flex items-center justify-center"
            onClick={() => search()}
          >
            <FiSearch size={22} />
          </button>
        </div>

        {/* RESULT SECTION */}
        <div className="mt-8">
          {!hasHistory ? (
            <p className="text-gray-600 text-center text-lg">
              No tracking data available.
            </p>
          ) : (
            <div className="space-y-8">
              {/* SUMMARY CARD */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <FiTruck className="text-blue-600" />
                  Shipment Summary
                </h3>

                <p>
                  <b>UID:</b> {first.uid}
                </p>
                <p>
                  <b>From:</b> {first.fromLocation}
                </p>
                <p>
                  <b>To:</b> {first.toName} ({first.toType})
                </p>
                <p>
                  <b>Dispatch Date:</b> {formatDate(first.dispatchDate)}
                </p>
                <p>
                  <b>Delivered Date:</b>{" "}
                  {last.deliveredDate ? formatDate(last.deliveredDate) : "Pending"}
                </p>
              </div>

              {/* FULL HISTORY TIMELINE */}
              <h3 className="text-2xl font-bold">Tracking History</h3>

              {history.map((h) => (
                <div
                  key={h.trackId}
                  className="bg-white/90 backdrop-blur-xl border-l-4 border-blue-600 rounded-xl p-5 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {statusIcon(h.status)}
                      <h3 className="text-xl font-bold">{h.status}</h3>
                    </div>
                    <span className="text-gray-500 flex items-center gap-2">
                      <FiHash /> {h.trackId}
                    </span>
                  </div>

                  <div className="space-y-1 text-gray-700">
                    <p>
                      <b>Location:</b>{" "}
                      {h.location || h.toName || h.fromLocation || "—"}
                    </p>
                    <p>
                      <b>Remarks:</b> {h.remarks || "—"}
                    </p>
                    <p>
                      <b>Updated At:</b> {formatDate(h.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
