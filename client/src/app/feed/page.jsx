"use client";

import React, { useEffect, useState } from "react";

import PostCard from "../../components/PostCard";
import RequireAuth from "../../components/RequireAuth";
import CreatePost from "../../components/CreatePost";
import api from "../../services/api";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPosts = async () => {
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
    getPosts();
  }, []);

  const addPostToFeed = (post) => setPosts((prev) => [post, ...prev]);
  
  // ensure newly created posts have repost metadata defaults
  const addPostSafe = (post) => {
    const safe = { repostCount: 0, isRepostedByViewer: false, ...post };
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
          // remove the repost post and decrement counts for the original
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
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <CreatePost onPostCreated={addPostSafe} />

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={handleDelete}
            onLike={toggleLike}
                onCommentSubmit={addComment}
                onRepost={handleRepost}
          />
        ))
      )}
    </div>
  );
};

const Page = () => {
  return (
    <RequireAuth>
      <FeedPage />
    </RequireAuth>
  );
};

export default Page;
