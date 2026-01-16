import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext";

export default function UserLogin() {
  const nav = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);   // ✅ FIXED

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "user");

      setUser(res.data.user);

      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
      <div className="bg-white/20 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30">

        <h1 className="text-3xl font-bold text-center mb-6 text-white tracking-wide">
          User Login
        </h1>

        <form className="flex flex-col gap-4" onSubmit={submit}>
          <input
            name="email"
            placeholder="Email"
            onChange={change}
            className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-purple-300 outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={change}
            className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-purple-300 outline-none"
          />

          <button className="bg-purple-600 text-white font-semibold p-3 rounded-xl shadow-xl hover:bg-purple-700 transition">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-white">
          Don’t have an account?{" "}
          <Link to="/user/register" className="text-yellow-300 hover:underline">
            Register
          </Link>
        </p>
        <p className="text-center mt-2 text-white">
  Are you an admin?{" "}
  <Link to="/admin/login" className="text-red-300 hover:underline">
    Admin Login →
  </Link>
</p>


      </div>
    </div>
  );
}
