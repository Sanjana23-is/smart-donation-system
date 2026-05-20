import React, { useState, useEffect } from "react";
import { FiMonitor, FiLock, FiSave, FiAlertTriangle } from "react-icons/fi";
import api from "../../api";

export default function AdminSettings() {
  const [compactMode, setCompactMode] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return setMsg({ type: "error", text: "Please fill all fields" });
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.put("/admin/password", { currentPassword, newPassword });
      setMsg({ type: "success", text: res.data.message });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Error updating password" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">System Settings</h2>
      
      <div className="flex flex-col gap-6">
        
        {/* UI Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <FiMonitor className="text-indigo-500" /> Interface Preferences
          </h3>
          
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">Compact Table View</span>
                <span className="text-sm text-gray-500">Reduce padding in data tables for maximum density</span>
              </div>
              <input 
                type="checkbox" 
                checked={compactMode}
                onChange={() => setCompactMode(!compactMode)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Security / Password */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <FiLock className="text-red-500" /> Admin Security
          </h3>
          
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-6 border border-red-100">
            <FiAlertTriangle className="mt-1 flex-shrink-0" />
            <p className="text-sm font-medium">Warning: Changing the master admin password will log out all currently active administrative sessions across all devices.</p>
          </div>

          {msg && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-bold ${msg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-4 max-w-md">
            <div>
              <label className="text-sm font-semibold text-gray-600">Current Password</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password" 
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-300 outline-none" 
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password" 
                className="w-full mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-300 outline-none" 
              />
            </div>
            <div>
              <button type="submit" disabled={loading} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg disabled:opacity-70 transition">
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
