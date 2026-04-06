"use client";

import React, { useEffect, useState } from "react";
import RequireAuth from "../components/RequireAuth";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import api from "../services/api";

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

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <CreatePost onPostCreated={addPostToFeed} />

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
