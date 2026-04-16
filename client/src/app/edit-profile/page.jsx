"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "../../components/RequireAuth";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { ArrowLeft, Camera, User, Code, Link2, Globe, MonitorPlay, Users, X } from "lucide-react";
import { useAuth } from "../../context/authContext";

const EditProfilePage = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    bio: "",
    skills: [],
    github: "",
    linkedin: "",
    website: "",
    location: "",
    avatar: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const fetchMyProfile = async () => {
    try {
      const res = await api.get("/profile/my");
      const p = res.data.profile;
      
      setFormData({
        name: p.user?.name || "",
        headline: p.education || "",
        bio: p.bio || "",
        skills: p.skills || [],
        github: p.github || "",
        linkedin: p.linkedin || "",
        website: p.website || "",
        location: p.location || "",
        avatar: p.avatar || p.user?.avatar || "",
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

  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim().replace(/,$/, "");
      if (val && !formData.skills.includes(val)) {
        setFormData({ ...formData, skills: [...formData.skills, val] });
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove, e) => {
    e?.preventDefault();
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      const data = new FormData();
      data.append("avatar", file);
      const res = await api.post("/upload/avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, avatar: res.data.url });
    } catch (err) {
      // Error handling
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        bio: formData.bio,
        skills: formData.skills.join(", "),
        github: formData.github,
        linkedin: formData.linkedin,
        website: formData.website,
        location: formData.location,
        education: formData.headline,
        avatar: formData.avatar,
      };

      await api.post("/profile/create", payload, {
        headers: { "Content-Type": "application/json" },
      });
      await refreshUser();
      router.push("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">
          Edit Profile
        </h1>
        <button 
          onClick={handleSubmit} 
          disabled={saving}
          className="bg-primary-50 text-primary-600 px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-primary-100 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving" : "Save"}
        </button>
      </div>

      <div className="max-w-[480px] mx-auto px-4 mt-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[100px] h-[100px]">
            <img
              src={formData.avatar || "/default-avatar.svg"}
              alt="Avatar"
              className="w-full h-full rounded-[24px] object-cover shadow-sm bg-white"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/default-avatar.svg";
              }}
            />
            {avatarUploading && (
              <div className="absolute inset-0 rounded-[24px] bg-white/80 flex items-center justify-center">
                <div className="rounded-full border-2 border-primary-100 border-t-primary-600 animate-spin" style={{ width: 24, height: 24 }} />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 bg-[#4c5ae6] text-white w-[34px] h-[34px] flex items-center justify-center rounded-[12px] cursor-pointer shadow-md hover:bg-[#3f4ec9] transition-colors border-[3px] border-[#fafafa]">
              <Camera className="w-[18px] h-[18px]" strokeWidth={2.5} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
            </label>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{formData.name || "User Name"}</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">{formData.location || "Location not set"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900 text-[15px]">Identity</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2">
                  FULL NAME
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#f4f4f5] border-transparent focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100 rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2">
                  PROFESSIONAL HEADLINE
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  className="w-full bg-[#f4f4f5] border-transparent focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100 rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2">
                  BIO / ABOUT
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[#f4f4f5] border-transparent focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100 rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Expertise Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50">
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900 text-[15px]">Expertise</h3>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-3">
                CORE SKILLS
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-[13px] font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={(e) => removeSkill(skill, e)}
                      className="text-primary-500 hover:text-primary-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              
              <input
                type="text"
                placeholder="Add a skill (e.g. AWS, GraphQL) and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="w-full bg-[#f4f4f5] border-transparent focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100 rounded-lg px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Digital Presence Card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50">
            <div className="flex items-center gap-2 mb-6">
              <Link2 className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900 text-[15px]">Digital Presence</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-[46px] h-[46px] shrink-0 bg-[#f4f4f5] rounded-xl flex items-center justify-center text-primary-600 mt-1">
                  <Globe className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    PORTFOLIO WEBSITE
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-[#e4e4e7] focus:border-primary-400 focus:ring-1 focus:ring-primary-100 rounded-lg px-3 py-2 text-[14px] text-gray-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-[46px] h-[46px] shrink-0 bg-[#f4f4f5] rounded-xl flex items-center justify-center text-primary-600 mt-1">
                  <MonitorPlay className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    GITHUB URL
                  </label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-[#e4e4e7] focus:border-primary-400 focus:ring-1 focus:ring-primary-100 rounded-lg px-3 py-2 text-[14px] text-gray-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-[46px] h-[46px] shrink-0 bg-[#f4f4f5] rounded-xl flex items-center justify-center text-primary-600 mt-1">
                  <Users className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    LINKEDIN URL
                  </label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-[#e4e4e7] focus:border-primary-400 focus:ring-1 focus:ring-primary-100 rounded-lg px-3 py-2 text-[14px] text-gray-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 pb-6 space-y-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#3b44b8] text-white py-3.5 rounded-[12px] font-semibold text-[15px] shadow-[0_8px_20px_rgba(59,68,184,0.25)] hover:bg-[#31399e] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full text-gray-600 py-3 rounded-xl font-medium text-[15px] hover:bg-gray-100 transition-colors"
            >
              Discard Edits
            </button>
          </div>
        </form>
      </div>
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
