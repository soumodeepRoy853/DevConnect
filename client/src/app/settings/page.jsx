"use client";

import React, { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/authContext";

const SettingsPage = () => {
  const { auth, logout } = useAuth();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState("");

  useEffect(() => {
    if (!auth?.token) return;

    const fetchSaved = async () => {
      setSavedLoading(true);
      setSavedError("");
      try {
        const res = await api.get("/post/saved");
        setSavedPosts(res.data.posts || []);
      } catch (err) {
        setSavedError(err.response?.data?.message || "Failed to load saved posts.");
      } finally {
        setSavedLoading(false);
      }
    };

    fetchSaved();
  }, [auth?.token]);

  const handleChangePass = (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

    api
      .put("/user/change-password", {
        oldPassword: oldPass,
        newPassword: newPass,
      })
      .then(() => {
        setMsg("Password updated successfully.");
        setOldPass("");
        setNewPass("");
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to update password.");
      })
      .finally(() => setLoading(false));
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "DevConnect Profile", url });
      } catch {
        // No-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert("Profile link copied.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("This will permanently delete your account and profile. Continue?")) return;
    try {
      await api.delete("/profile/delete-profiles");
      logout();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete account.");
    }
  };

  const handleRemoveSaved = async (postId) => {
    try {
      await api.put(`/post/save/${postId}`);
      setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove saved post.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 space-y-10">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Account Settings</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleShareProfile}
            className="px-4 py-2 rounded-lg bg-[#d7edf7] text-[#355970] font-semibold"
          >
            Share Profile
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100"
          >
            Delete Account
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Signed in as {auth?.user?.email}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handleChangePass} className="space-y-4">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-70"
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Saved Posts</h2>
          <span className="text-sm text-gray-500">{savedPosts.length}</span>
        </div>

        {savedLoading ? (
          <div className="py-6">
            <Loader label="Loading" />
          </div>
        ) : savedError ? (
          <p className="text-sm text-red-600">{savedError}</p>
        ) : savedPosts.length === 0 ? (
          <p className="text-sm text-gray-500">No saved posts yet.</p>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <div key={post._id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="text-sm font-semibold text-gray-900">
                  {post.user?.name || "Unknown"}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {post.text || "(No text)"}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleRemoveSaved(post._id)}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.assign(`/post/${post._id}`)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  );
};

export default Page;
