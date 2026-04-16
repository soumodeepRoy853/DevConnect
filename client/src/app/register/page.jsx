"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiUser, FiAtSign, FiLock, FiEye } from "react-icons/fi";

const RegisterPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!agree) return setError("You must agree to the Terms of Service.");

    try {
      await api.post("/user/add-user", formData);
      alert("Registered successfully! Please login.");
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <div className="text-2xl font-extrabold text-indigo-600">DevConnect</div>
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Create Account</h1>
        <p className="text-gray-500 mb-6">Enter your details to begin your journey.</p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold text-gray-600">FULL NAME</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
            <FiUser className="text-gray-400 mr-3" />
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Linus Torvalds"
              className="bg-transparent outline-none w-full text-gray-700"
              required
            />
          </div>

          <label className="block text-xs font-semibold text-gray-600">EMAIL ADDRESS</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
            <FiAtSign className="text-gray-400 mr-3" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="hello@devconnect.io"
              className="bg-transparent outline-none w-full text-gray-700"
              required
            />
          </div>

          <label className="block text-xs font-semibold text-gray-600">SECURE PASSWORD</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
            <FiLock className="text-gray-400 mr-3" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="bg-transparent outline-none w-full text-gray-700"
              required
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="ml-3 text-gray-500">
              <FiEye />
            </button>
          </div>

          <div className="flex items-start space-x-3">
            <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 mt-1" />
            <label htmlFor="agree" className="text-sm text-gray-600">I agree to the <a className="text-indigo-600">Terms of Service</a> and <a className="text-indigo-600">Privacy Policy</a>.</label>
          </div>

          <button
            type="submit"
            className="w-full text-white py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg flex items-center justify-center gap-2"
          >
            Register <span aria-hidden>→</span>
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-400">— OR CONTINUE WITH —</div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => signIn('github', { callbackUrl: '/' })}
            className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg py-3"
            aria-label="Sign up with GitHub"
          >
            <FaGithub /> GitHub
          </button>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg py-3"
            aria-label="Sign up with Google"
          >
            <FcGoogle /> Google
          </button>
        </div>

        <p className="text-center text-sm mt-6 text-gray-500">Already have an account?</p>
        <div className="flex justify-center mt-3">
          <button onClick={() => router.push('/login')} className="px-6 py-2 border rounded-lg text-indigo-600">Log In</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
