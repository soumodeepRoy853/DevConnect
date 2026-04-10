"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import api from "../services/api";

const CreatePost = ({ onPostCreated }) => {
  const { auth } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

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
        visibility,
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
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <img
            src={auth.user?.avatar || "/default-avatar.svg"}
            alt="you"
            className="w-12 h-12 rounded-full object-cover border"
          />

          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What is on your mind?"
              className="w-full p-3 border border-gray-200 rounded-md mb-2 focus:ring-2 focus:ring-blue-100 resize-none"
              rows="3"
            />

            {preview && (
              <div className="mb-2 relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full rounded-md object-cover max-h-60 border"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-white/80 text-sm px-2 py-1 rounded-md hover:bg-white"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="post-image"
                  className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-sm"
                >
                  Choose Image
                </label>

                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="p-2 border rounded-md text-sm bg-white min-w-[120px]"
                >
                  <option value="public">Public</option>
                  <option value="followers">Only followers</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
