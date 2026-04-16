"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import RequireAuth from "../components/RequireAuth";
import CreatePost from "../components/CreatePost";
import Loader from "../components/Loader";
import PostCard from "../components/PostCard";
import MobileBottomNav from "../components/MobileBottomNav";
import api from "../services/api";

const DashboardPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/post/feed");
      const nextPosts = res.data.posts || [];
      setPosts(nextPosts.slice().reverse());
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    const safe = { repostCount: 0, isRepostedByViewer: false, ...newPost };
    setPosts((prev) => [safe, ...prev]);
  };

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/post/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      // No-op
    }
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

  const handleSave = async (postId) => {
    try {
      const res = await api.put(`/post/save/${postId}`);
      const saved = res.data.saved;
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, isSavedByViewer: saved } : p
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save post.");
    }
  };

  const handleEdit = async (postId, payload) => {
    const cleaned = {
      text: payload.text,
      image: payload.image,
      removeImage: payload.removeImage,
    };
    const res = await api.put(`/post/${postId}`, cleaned);
    const updated = res.data.post;
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, ...updated } : p)));
  };

  const focusComposer = () => {
    const input = document.getElementById("create-post-input");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen px-4 pb-28 pt-6">
      <div className="mx-auto w-full max-w-xl">
        <CreatePost onPostCreated={handlePostCreated} />

        <div className="space-y-4">
          {loading ? (
            <div className="py-6">
              <Loader label="Loading" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-sm text-gray-500">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={toggleLike}
                onCommentSubmit={addComment}
                onRepost={handleRepost}
                onDelete={handleDelete}
                onSave={handleSave}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={focusComposer}
        aria-label="Create new post"
        className="md:hidden fixed bottom-20 right-5 z-40 w-12 h-12 rounded-full bg-primary-600 text-white shadow-[0_12px_28px_rgba(67,56,202,0.35)] flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      <MobileBottomNav />
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
