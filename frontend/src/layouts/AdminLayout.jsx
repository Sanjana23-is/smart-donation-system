import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../pages/Admin/AdminSidebar";
import AdminNav from "../pages/Admin/AdminNav";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNav />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-100 to-gray-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
