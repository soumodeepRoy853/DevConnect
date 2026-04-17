"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import RequireAuth from "../../components/RequireAuth";
import Loader from "../../components/Loader";
import MobileBottomNav from "../../components/MobileBottomNav";
import api from "../../services/api";
import { FileX2, Link2, Mail, Settings, PenLine, Github, Linkedin } from "lucide-react";

const ProfilePage = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [followData, setFollowData] = useState({ followers: [], following: [] });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/my");
      setProfile(res.data.profile);
      setError("");
    } catch (err) {
      if (err?.response?.status === 404) {
        setProfile(null);
        setError("");
      } else {
        setError("Failed to fetch profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!auth?.user?.id) return;

    try {
      const res = await api.get(`/post/user/${auth.user.id}`);
      setPosts(res.data.posts || []);
    } catch {
      // No-op
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [auth?.token]);

  useEffect(() => {
    const userId = profile?.user?._id || auth?.user?.id;
    if (!userId) return;

    const fetchFollowData = async () => {
      try {
        const res = await api.get(`/follow/${userId}/follow-data`);
        setFollowData(res.data || { followers: [], following: [] });
      } catch {
        setFollowData({ followers: [], following: [] });
      }
    };

    fetchFollowData();
  }, [profile?.user?._id, auth?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader label="Loading" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500 text-lg">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center mt-20 text-gray-600 space-y-4">
        <p>No profile found. Please create one.</p>
        <Link
          href="/create-profile"
          className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Create Profile
        </Link>
      </div>
    );
  }

  const roleLabel = profile.education?.trim() || "Developer";
  const aboutText = profile.bio || "Tell the community what you are building and learning.";
  const curatorBase = (profile.skills?.[0] || "DEV").replace(/[^a-z0-9]+/gi, "_").toUpperCase();
  const curatorId = `${curatorBase}_01`;
  const postCount = posts.length;
  const hasPosts = postCount > 0;
  const formatUrl = (value) => {
    if (!value) return "";
    try {
      const cleaned = value.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
      return cleaned.replace(/\/$/, "");
    } catch {
      return value;
    }
  };

  const normalizeUrl = (value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
  };

  const normalizeSocialUrl = (value, basePath) => {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const withoutWww = trimmed.replace(/^www\./i, "");
    if (/linkedin\.com|github\.com/i.test(withoutWww)) {
      return `https://${withoutWww}`;
    }
    const handle = withoutWww.replace(/^@/, "");
    return `https://${basePath}/${handle}`;
  };

  return (
    <div className="min-h-screen px-4 pb-28 pt-6">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="bg-white/90 rounded-3xl p-6 shadow-sm border border-white/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatar || profile.user?.avatar || "/default-avatar.svg"}
                alt="Avatar"
                className="w-12 h-12 rounded-2xl border border-white/70 object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.svg";
                }}
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{profile.user.name}</h2>
                <p className="text-sm text-primary-600">{roleLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/edit-profile"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                aria-label="Edit Profile"
              >
                <PenLine className="h-4 w-4" />
              </Link>
              <Link
                href="/settings"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-12 text-center text-sm text-gray-700">
            <div>
              <div className="text-base font-semibold text-gray-900">{followData.followers?.length || 0}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div>
              <div className="text-base font-semibold text-gray-900">{followData.following?.length || 0}</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => router.push("/edit-profile")}
              className="w-full rounded-xl bg-primary-600 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(67,56,202,0.3)] hover:bg-primary-700"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={async () => {
                const url = window.location.href;
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
              }}
              className="w-full rounded-xl bg-[#d7edf7] py-2 text-sm font-semibold text-[#355970]"
            >
              Share Profile
            </button>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl p-5 shadow-sm border border-white/80">
          <div className="text-xs font-semibold tracking-[0.2em] text-gray-400">ABOUT</div>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{aboutText}</p>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-600" />
              <span>{profile.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary-600" />
              {profile.website ? (
                <a
                  href={normalizeUrl(profile.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-700 hover:text-primary-600"
                >
                  {formatUrl(profile.website)}
                </a>
              ) : (
                <span className="text-gray-400">Add your website in Edit Profile</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-primary-600" />
              {profile.github ? (
                <a
                  href={normalizeSocialUrl(profile.github, "github.com")}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-700 hover:text-primary-600"
                >
                  {formatUrl(profile.github)}
                </a>
              ) : (
                <span className="text-gray-400">Add your GitHub in Edit Profile</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-primary-600" />
              {profile.linkedin ? (
                <a
                  href={normalizeSocialUrl(profile.linkedin, "www.linkedin.com/in")}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-700 hover:text-primary-600"
                >
                  {formatUrl(profile.linkedin)}
                </a>
              ) : (
                <span className="text-gray-400">Add your LinkedIn in Edit Profile</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl p-5 shadow-sm border border-white/80">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Technical Arsenal</h3>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600">
              {profile.skills?.length || 0} Skills
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(profile.skills || []).map((skill, idx) => (
              <span
                key={`${skill}-${idx}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {skill}
              </span>
            ))}
            {profile.skills?.length === 0 && (
              <span className="text-sm text-gray-400">Add skills to show your stack.</span>
            )}
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl p-5 shadow-sm border border-white/80">
          <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
          {hasPosts ? (
            <div className="mt-4 space-y-3">
              {posts.slice(0, 3).map((post) => (
                <div key={post._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">
                    {post.text || "(No text)"}
                  </p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="post"
                      className="mt-3 w-full rounded-xl max-h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-post.svg";
                      }}
                    />
                  )}
                  <div className="mt-3 text-xs text-gray-400">
                    {post.likes?.length || 0} Likes - {post.comments?.length || 0} Comments
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 px-6 py-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                <FileX2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-700">You have not posted anything yet.</p>
              <p className="mt-2 text-xs text-gray-500">
                Your recent thoughts, code snippets, and updates will appear here once you start sharing.
              </p>
              <Link
                href="/feed"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(67,56,202,0.3)]"
              >
                <span className="text-lg leading-none">+</span>
                Create First Post
              </Link>
            </div>
          )}
        </div>

        <div className="bg-[#111111] rounded-2xl p-4 text-[#d9ddff] shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-gray-400">
            <span>Curator</span>
            <span>CURATOR_ID: {curatorId}</span>
          </div>
          <pre className="text-xs leading-relaxed overflow-auto">
{`const user = {
  name: "${profile.user.name}",
  role: "${roleLabel}",
  status: "Active",
  curating: true
};`}
          </pre>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

const Page = () => {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
};

export default Page;
