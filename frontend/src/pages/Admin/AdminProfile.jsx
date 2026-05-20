import React from "react";
import { FiShield, FiMail, FiServer, FiCheckCircle } from "react-icons/fi";

export default function AdminProfile() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">Admin Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Identity Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-gray-800 to-black rounded-full flex items-center justify-center text-white shadow-inner mb-4">
              <FiShield size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">System Administrator</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mt-2">Super Admin Role</span>
            
            <div className="mt-6 w-full flex flex-col gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                <FiMail className="text-gray-400" />
                <span className="truncate flex-1 text-left">admin@smartdonation.com</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                <FiServer className="text-gray-400" />
                <span className="truncate flex-1 text-left">Global Server Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Recent System Activity (Read-Only)</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1"><FiCheckCircle /></div>
                <div>
                  <p className="font-semibold text-gray-800">Approved Disaster Request #8492</p>
                  <p className="text-sm text-gray-500">Kerala Floods Relief - Sent 50 Blankets</p>
                  <span className="text-xs text-gray-400 mt-1 block">2 hours ago</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1"><FiCheckCircle /></div>
                <div>
                  <p className="font-semibold text-gray-800">Verified New Inventory Shipment</p>
                  <p className="text-sm text-gray-500">Added 120 Food Packets to Main Warehouse</p>
                  <span className="text-xs text-gray-400 mt-1 block">Yesterday</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full mt-1"><FiServer /></div>
                <div>
                  <p className="font-semibold text-gray-800">System Backup Completed</p>
                  <p className="text-sm text-gray-500">Automated database snapshot generated successfully.</p>
                  <span className="text-xs text-gray-400 mt-1 block">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
