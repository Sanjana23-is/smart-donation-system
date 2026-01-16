import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

export default function UserRegister() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);   // ✅ FIXED
      alert("Account created successfully!");
      nav("/user/login");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30">
        
        <h1 className="text-3xl font-bold text-center mb-6 text-white tracking-wide">
          Create Your Account
        </h1>

        <form className="flex flex-col gap-4" onSubmit={submit}>
          <input
            name="name"
            placeholder="Full Name"
            className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-300 outline-none"
            onChange={change}
          />

          <input
            name="email"
            placeholder="Email"
            className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-300 outline-none"
            onChange={change}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-300 outline-none"
            onChange={change}
          />

          <button className="bg-blue-600 text-white font-semibold p-3 mt-2 rounded-xl shadow-xl hover:bg-blue-700 transition">
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-white">
          Already have an account?{" "}
          <Link to="/user/login" className="text-yellow-300 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
