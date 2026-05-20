import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

export default function UserRegister() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      alert("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/verify-otp", { email: form.email, otp });
      alert("Account verified successfully! You can now log in.");
      nav("/user/login");
    } catch (err) {
      alert(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/30">
        <h1 className="text-3xl font-bold text-center mb-6 text-white tracking-wide">
          {step === 1 ? "Create Your Account" : "Verify Email"}
        </h1>

        {step === 1 ? (
          <form className="flex flex-col gap-4" onSubmit={submitRegister}>
            <input
              name="name"
              placeholder="Full Name"
              className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-300 outline-none"
              onChange={change}
              value={form.name}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-300 outline-none"
              onChange={change}
              value={form.email}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-300 outline-none"
              onChange={change}
              value={form.password}
            />

            <button className="bg-blue-600 text-white font-semibold p-3 mt-2 rounded-xl shadow-xl hover:bg-blue-700 transition">
              Register
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={submitOtp}>
            <p className="text-white text-center text-sm mb-2">
              We've sent a 6-digit OTP to <b>{form.email}</b>.
            </p>
            <input
              name="otp"
              placeholder="Enter 6-digit OTP"
              className="p-3 rounded-xl bg-white/90 focus:ring-2 focus:ring-blue-300 outline-none text-center tracking-widest text-lg font-mono"
              maxLength="6"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
            />
            <button className="bg-green-600 text-white font-semibold p-3 mt-2 rounded-xl shadow-xl hover:bg-green-700 transition">
              Verify OTP
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="text-center mt-4 text-white">
            Already have an account?{" "}
            <Link to="/user/login" className="text-yellow-300 hover:underline">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
