"use client";

import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import api from "../services/api";

const CreatePost = ({ onPostCreated }) => {
  const { auth } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    if (!image) return null;
    const formData = new FormData();
    formData.append("image", image);

    const res = await api.post("/upload/post", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;

    setLoading(true);
    try {
      const imageUrl = await handleImageUpload();
      const res = await api.post("/post", {
        text,
        image: imageUrl || "",
      });

      if (onPostCreated) {
        onPostCreated(res.data.post);
      }
      setText("");
      setImage(null);
    } catch {
      alert("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  if (!auth?.token) return null;

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What is on your mind?"
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
