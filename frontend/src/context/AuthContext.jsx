import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  function logout() {
    localStorage.clear();
    setUser(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, admin, setAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
