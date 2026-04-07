"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import RequireAuth from "../components/RequireAuth";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import api from "../services/api";

const DashboardPage = () => {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/post/feed");
      setPosts(res.data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchPosts();
    }
  }, [auth?.token]);

  const handlePostCreated = (newPost) => {
    const safe = { repostCount: 0, isRepostedByViewer: false, ...newPost };
    setPosts((prev) => [safe, ...prev]);
  };

  const toggleLike = async (postId) => {
    try {
      const res = await api.put(`/post/like/${postId}`, {});
      const updatedPost = res.data.post;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: updatedPost.likes } : p
        )
      );
    } catch {
      // No-op
    }
  };

  const addComment = async (postId, text) => {
    try {
      const res = await api.post(`/post/comment/${postId}`, { text });
      const updatedComments = res.data.comments;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: updatedComments } : p
        )
      );
    } catch {
      // No-op
    }
  };

  const handleRepost = async (originalId, alreadyReposted) => {
    try {
      if (alreadyReposted) {
        const res = await api.post(`/post/unrepost/${originalId}`);
        const repostId = res.data.repostId;
        setPosts((prev) => {
          const filtered = prev.filter((p) => p._id !== repostId);
          return filtered.map((p) => {
            const orig = p.repostOf ? (p.repostOf._id || p.repostOf) : p._id;
            if (String(orig) === String(originalId)) {
              return { ...p, repostCount: Math.max(0, (p.repostCount || 0) - 1), isRepostedByViewer: false };
            }
            return p;
          });
        });
      } else {
        const res = await api.post(`/post/repost/${originalId}`);
        const newPost = res.data.post;
        setPosts((prev) => {
          const updated = [newPost, ...prev];
          return updated.map((p) => {
            const orig = p.repostOf ? (p.repostOf._id || p.repostOf) : p._id;
            if (String(orig) === String(originalId)) {
              return { ...p, repostCount: (p.repostCount || 0) + 1, isRepostedByViewer: true };
            }
            return p;
          });
        });
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) alert("You have already reposted this post.");
      else if (status === 403) alert("Cannot repost non-public post.");
      else alert("Failed to repost.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Hello, {auth?.user?.name}
          </h1>
          <p className="text-gray-600">
            Logged in as <strong>{auth?.user?.email}</strong>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <button
              onClick={() => router.push("/create-profile")}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Create Profile
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              My Profile
            </button>
            <button
              onClick={() => router.push("/explore")}
              className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Discover
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <CreatePost onPostCreated={handlePostCreated} />

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={toggleLike}
                onCommentSubmit={addComment}
                onRepost={handleRepost}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  );
};

export default Page;
