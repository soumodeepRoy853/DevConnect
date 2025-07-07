import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import { useNavigate } from "react-router-dom";
import CreatePost from "./CreatePost.jsx";
import axios from "axios";
import PostCard from "../components/PostCard.jsx";

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/post/feed`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const toggleLike = async (postId) => {
    try {
      // console.log("Post ID", postId)
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/post/like/${postId}`,
      {},
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    );

    const updatedPost = res.data.post;

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: updatedPost.likes } : p
      )
    );
  } catch (err) {
    // console.error("Like error:", err?.response?.data || err.message);
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

    const updatedComments = res.data.comments; // correct field

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
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Welcome */}
        <div className="bg-white rounded-lg shadow p-6 text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Hello, {auth?.user?.name} 👋
          </h1>
          <p className="text-gray-600">
            Logged in as <strong>{auth?.user?.email}</strong>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <button
              onClick={() => navigate("/create-profile")}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Create Profile
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              My Profile
            </button>
            <button
              onClick={() => navigate("/explore")}
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

        {/* Create Post */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* Feed */}
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
