"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "../components/RequireAuth";
import api from "../services/api";

const EditProfilePage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    github: "",
    linkedin: "",
    website: "",
    location: "",
    education: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchMyProfile = async () => {
    try {
      const res = await api.get("/profile/my");

      const p = res.data.profile;
      setFormData({
        bio: p.bio || "",
        skills: p.skills?.join(", ") || "",
        github: p.github || "",
        linkedin: p.linkedin || "",
        website: p.website || "",
        location: p.location || "",
        education: p.education || "",
        avatar: p.avatar || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    try {
      await api.post("/profile/create", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => router.push("/profile"), 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong.";
      setError(errorMsg);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">Edit Profile</h2>

      {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
      {successMsg && (
        <div className="text-green-600 mb-4 text-center">{successMsg}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-md rounded-md space-y-4"
      >
        <input
          type="text"
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma separated)"
          value={formData.skills}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="github"
          placeholder="GitHub URL"
          value={formData.github}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="linkedin"
          placeholder="LinkedIn URL"
          value={formData.linkedin}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="website"
          placeholder="Personal Website"
          value={formData.website}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="education"
          placeholder="Education"
          value={formData.education}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="avatar"
          placeholder="Avatar URL (optional)"
          value={formData.avatar}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

const Page = () => {
  return (
    <RequireAuth>
      <EditProfilePage />
    </RequireAuth>
  );
};

export default Page;
