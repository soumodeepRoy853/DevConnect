import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext.jsx";

const CreatePost = ({ onPostCreated }) => {
  const { auth } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    if (!image) return null;
    const formData = new FormData();
    formData.append("image", image);

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/upload/post`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    return res.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    setLoading(true);
    try {
      const imageUrl = await handleImageUpload();
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/post`,
        {
          text,
          image: imageUrl || "",
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      onPostCreated(res.data.post);
      setText("");
      setImage(null);
    } catch (err) {
      // console.error("Create post failed", err);
      alert("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-3 border rounded mb-2"
        rows="3"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default CreatePost;
