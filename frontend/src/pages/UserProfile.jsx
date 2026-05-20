import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { FiMail, FiPhone, FiMapPin, FiCheckCircle, FiActivity, FiBox } from "react-icons/fi";

export default function UserProfile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/user/profile");
        setProfile(res.data.user);
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (!profile) return <div className="p-8">Error loading profile.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">My Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Identity Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-inner">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
            
            <div className="mt-6 w-full flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <FiMail className="text-blue-500" />
                <span className="truncate flex-1 text-left">{profile.email}</span>
                {profile.is_verified ? (
                  <FiCheckCircle className="text-green-500" title="Verified" />
                ) : (
                  <span className="text-xs text-red-500 font-bold">Unverified</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <FiPhone className="text-blue-500" />
                <span className="truncate flex-1 text-left">{profile.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                <FiMapPin className="text-blue-500" />
                <span className="truncate flex-1 text-left">{profile.address || "No address set"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Impact Stats */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiActivity className="text-indigo-500" /> My Total Impact
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-indigo-100">
                <p className="text-indigo-800 font-medium mb-1">Total Monetary Donations</p>
                <p className="text-3xl font-extrabold text-indigo-600">₹{stats?.totalMoney || 0}</p>
                <p className="text-xs text-indigo-500 mt-1">Across {stats?.monetaryCount || 0} donations</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-green-100">
                <p className="text-green-800 font-medium mb-1">Items Donated</p>
                <p className="text-3xl font-extrabold text-green-600">{stats?.totalItems || 0}</p>
                <p className="text-xs text-green-500 mt-1 flex items-center justify-center gap-1"><FiBox /> successfully delivered</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Privacy Settings Overview</h3>
            <p className="text-sm text-gray-600 mb-4">You can update these preferences in the Settings page.</p>
            
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${profile.donations_anonymous ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                Anonymous Donations: <span className="font-semibold">{profile.donations_anonymous ? "Enabled" : "Disabled"}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${profile.notifications_enabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                Email Notifications: <span className="font-semibold">{profile.notifications_enabled ? "Enabled" : "Disabled"}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
