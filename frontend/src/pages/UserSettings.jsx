import React, { useEffect, useState } from "react";
import api from "../api";
import { FiSave, FiLock, FiShield, FiBell } from "react-icons/fi";

export default function UserSettings() {
  const [profile, setProfile] = useState({
    phone: "",
    address: "",
    donations_anonymous: false,
    notifications_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/user/profile");
        setProfile({
          phone: res.data.user.phone || "",
          address: res.data.user.address || "",
          donations_anonymous: !!res.data.user.donations_anonymous,
          notifications_enabled: !!res.data.user.notifications_enabled
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/user/profile", profile);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">Account Settings</h2>
      
      {message && (
        <div className={`mb-6 p-4 rounded-xl font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <FiUser className="text-blue-500" /> Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Phone Number</label>
              <input 
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Default Pickup Address</label>
              <textarea 
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your full address..."
                rows="3"
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <FiShield className="text-green-500" /> Privacy & Notifications
          </h3>
          
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition">
              <input 
                type="checkbox" 
                name="donations_anonymous"
                checked={profile.donations_anonymous}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">Make my donations anonymous</span>
                <span className="text-sm text-gray-500">Your name will not appear on public leaderboards or orphanage donor lists.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition">
              <input 
                type="checkbox" 
                name="notifications_enabled"
                checked={profile.notifications_enabled}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 flex items-center gap-2">Enable Email Notifications <FiBell className="text-yellow-500" /></span>
                <span className="text-sm text-gray-500">Receive alerts when your donations are approved or picked up.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Security / Password */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <FiLock className="text-red-500" /> Security
          </h3>
          <p className="text-sm text-gray-600 mb-4">To change your password, please click the button below. A reset link will be sent to your registered email.</p>
          <button type="button" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
            Request Password Reset
          </button>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition flex items-center gap-2 disabled:opacity-70"
          >
            <FiSave /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Quick dummy icon for FiUser since it wasn't imported at top
function FiUser(props) {
  return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
}
