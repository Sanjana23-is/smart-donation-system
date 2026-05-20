import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import { Snackbar, Alert } from "@mui/material";

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
import Notifications from "./pages/Notifications";
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
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import { useContext, useEffect } from "react";

function SocketWrapper({ children }) {
  const { user } = useContext(AuthContext);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Attempt to load user from localStorage if context isn't set yet
    const storedUser = user || JSON.parse(localStorage.getItem('user'));
    
    if (storedUser?.userId) {
      const socket = io("http://localhost:3000");
      socket.emit("join", storedUser.userId);

      socket.on("decision_update", (data) => {
        setToast({
           message: `Update: Your product "${data.productName}" was ${data.decision}!`,
           type: data.decision === 'approved' ? 'success' : 'error'
        });
      });

      return () => socket.disconnect();
    }
  }, [user]);

  return (
    <>
      {children}
      <Snackbar open={!!toast} autoHideDuration={10000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setToast(null)} severity={toast?.type || 'info'} sx={{ width: '100%', fontSize: '16px' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

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

      case "Notifications":
        return <Notifications />;

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
      <SocketWrapper>
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
      </SocketWrapper>
    </AuthProvider>
  );
}
