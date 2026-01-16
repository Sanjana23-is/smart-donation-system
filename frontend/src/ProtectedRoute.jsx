import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // "user" or "admin"

  // No token → not logged in
  if (!token) {
    return <Navigate to="/user/login" replace />;
  }

  // If specific role is required but doesn't match → redirect
  if (role && userRole !== role) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
}
