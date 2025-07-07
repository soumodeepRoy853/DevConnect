import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext.jsx";
import CreatePost from "./CreatePost.jsx";
import PostCard from "../components/PostCard.jsx";

const Feed = () => {
  const { auth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/post/feed`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setPosts(res.data.posts.reverse());
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  const addPostToFeed = (post) => setPosts([post, ...posts]);

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/post/like/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      const updatedPost = res.data.post;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: updatedPost.likes } : p
        )
      );
    } catch (err) {
      console.error("Like error:", err.message);
    }
  };

 const addComment = async (postId, text) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/post/comment/${postId}`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    const updatedComments = res.data.comments; //correct key

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, comments: updatedComments } : p
      )
    );
  } catch (err) {
    console.error("Comment error:", err.response?.data || err.message);
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

export default Feed;
