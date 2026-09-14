import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("admin");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    setUser(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, admin, setAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
