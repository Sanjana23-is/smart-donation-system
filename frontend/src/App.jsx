import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ------------------- USER COMPONENTS -------------------
import Nav from "./components/Nav";
import Dashboard from "./pages/Dashboard";
import Donors from "./pages/Donors";
import Donations from "./pages/Donations";
import Products from "./pages/Products";
import Disasters from "./pages/Disasters";
import Orphanages from "./pages/Orphanages";
import QRPage from "./pages/QRPage";
import DisasterRequestForm from "./pages/DisasterRequestForm";
import Tracking from "./pages/Tracking";
import ItemDonation from "./pages/ItemDonation";
import ExpiringItems from "./pages/Admin/ExpiringItems";

// ------------------- AUTH -------------------
import UserLogin from "./pages/Auth/UserLogin";
import UserRegister from "./pages/Auth/UserRegister";
import AdminLogin from "./pages/Auth/AdminLogin";

// ------------------- ADMIN PAGES -------------------
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminRequests from "./pages/Admin/AdminRequests";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminDonations from "./pages/Admin/AdminDonations";
import AdminOrphanages from "./pages/Admin/AdminOrphanages";
import AdminDisasters from "./pages/Admin/AdminDisasters";
import AdminInventories from "./pages/Admin/AdminInventories";
import AdminRedirect from "./pages/Admin/AdminRedirect";

// ------------------- CONTEXT + PROTECTION -------------------
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  const [current, setCurrent] = useState("Dashboard");

  // USER PAGE SWITCHER (DASHBOARD ONLY)
  function renderUserPages() {
    switch (current) {
      case "Donors":
        return <Donors />;

      case "Donations":
        return <Donations />;

      case "Products":
        return <Products />;

      case "Disasters":
        return <Disasters />;

      case "RequestDisaster":
        return <DisasterRequestForm />;

      case "Orphanages":
        return <Orphanages />;

      case "QR":
        return <QRPage />;

      case "Track":
        return <Tracking />;

      default:
        return <Dashboard />;
    }
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ---------------- PUBLIC ROUTES ---------------- */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ---------------- USER DASHBOARD ---------------- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="user">
                <div className="min-h-screen">
                  <Nav current={current} setCurrent={setCurrent} />
                  <div className="max-w-6xl mx-auto p-6">
                    {renderUserPages()}
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* ---------------- USER TRACKING PAGE ---------------- */}
          <Route
            path="/track"
            element={
              <ProtectedRoute role="user">
                <Tracking />
              </ProtectedRoute>
            }
          />

          {/* ---------------- USER ITEM DONATION PAGE ---------------- */}
          <Route
            path="/donate-items"
            element={
              <ProtectedRoute role="user">
                <ItemDonation />
              </ProtectedRoute>
            }
          />

          {/* ---------------- ADMIN DASHBOARD ---------------- */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ---------------- ADMIN ROUTES ---------------- */}
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute role="admin">
                <AdminRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute role="admin">
                <AdminProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/donations"
            element={
              <ProtectedRoute role="admin">
                <AdminDonations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/expiring"
            element={<ExpiringItems />}
          />

          <Route
            path="/admin/orphanages"
            element={
              <ProtectedRoute role="admin">
                <AdminOrphanages />
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

          <Route
            path="/admin/disasters"
            element={
              <ProtectedRoute role="admin">
                <AdminDisasters />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/inventories"
            element={
              <ProtectedRoute role="admin">
                <AdminInventories />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/redirect" element={<AdminRedirect />} />

          {/* ---------------- DEFAULT ROUTE ---------------- */}
          <Route path="*" element={<Navigate to="/user/login" />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
