import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function AdminLogin() {
  const nav = useNavigate();
  const { setAdmin } = useContext(AuthContext);

  const [form, setForm] = useState({ username: "", password: "" });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/admin/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "admin");
      localStorage.setItem("admin", JSON.stringify(res.data.admin));

      setAdmin(res.data.admin);
      nav("/admin/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Admin login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-300">
          Admin Panel Login
        </h1>

        <form className="flex flex-col gap-4" onSubmit={submit}>

          <input
            name="username"
            placeholder="Admin Username"
            onChange={change}
            className="p-3 rounded-xl bg-white/90 outline-none focus:ring-2 focus:ring-yellow-300"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={change}
            className="p-3 rounded-xl bg-white/90 outline-none focus:ring-2 focus:ring-yellow-300"
          />

          <button className="bg-yellow-400 text-black font-semibold p-3 rounded-xl shadow-xl hover:bg-yellow-500 transition">
            Login as Admin
          </button>

        </form>
      </div>
    </div>
  );
}
