"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiAtSign, FiLock } from "react-icons/fi";

const LoginPage = () => {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/user/login-user", formData);
      const data = res.data;
      setAuth({ user: data.user, token: data.token });
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <div className="text-2xl font-extrabold text-indigo-600">DevConnect</div>
        </div>

        <h1 className="text-3xl font-extrabold mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-6">Sign in to your curator workspace.</p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold text-gray-600">EMAIL ADDRESS</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
            <FiAtSign className="text-gray-400 mr-3" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="bg-transparent outline-none w-full text-gray-700"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-600">PASSWORD</label>
            <a className="text-sm text-indigo-600" href="#">Forgot?</a>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
            <FiLock className="text-gray-400 mr-3" />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="bg-transparent outline-none w-full text-gray-700"
              required
            />
          </div>

          <div className="flex items-start space-x-3">
            <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 mt-1" />
            <label htmlFor="remember" className="text-sm text-gray-600">Remember this device</label>
          </div>

          <button type="submit" className="w-full text-white py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">Login</button>
        </form>

        <div className="my-6 text-center text-sm text-gray-400">— OR CONTINUE WITH —</div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => signIn('github', { callbackUrl: '/' })} className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg py-3">
            <FaGithub /> GitHub
          </button>
          <button onClick={() => signIn('google', { callbackUrl: '/' })} className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg py-3">
            <FcGoogle /> Google
          </button>
        </div>

        <p className="text-center text-sm mt-6 text-gray-600">New to the community? <button onClick={() => router.push('/register')} className="text-indigo-600">Register now</button></p>
      </div>
    </div>
  );
};

export default LoginPage;
