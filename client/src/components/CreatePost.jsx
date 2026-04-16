"use client";

import React, { useState, useEffect } from "react";
import { Code2, Image as ImageIcon, Paperclip } from "lucide-react";
import { useAuth } from "../context/authContext";
import api from "../services/api";
import Loader from "./Loader";

const CreatePost = ({ onPostCreated }) => {
  const { auth } = useAuth();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
    try {
      const res = await api.post("/upload/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.url;
    } finally {
      setUploading(false);
    }
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
      <div className="bg-white/90 p-4 sm:p-5 rounded-3xl shadow-sm border border-white/70">
        <div className="flex items-start gap-3">
          <img
            src={auth.user?.avatar || "/default-avatar.svg"}
            alt="you"
            className="w-12 h-12 rounded-full object-cover border border-white/60"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-avatar.svg";
            }}
          />

          <div className="flex-1">
            <textarea
              id="create-post-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What are you building today?"
              className="w-full bg-[#f4f2f5] px-5 py-4 rounded-3xl text-sm sm:text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
              rows="2"
            />

            {preview && (
              <div className="mt-3 relative">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full rounded-2xl object-cover max-h-64 border border-white/70"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 bg-white/90 text-xs px-3 py-1 rounded-full hover:bg-white"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
                  aria-label="Add code block"
                >
                  <Code2 className="w-4 h-4" />
                </button>

                <input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="post-image"
                  className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  aria-label="Add image"
                >
                  <ImageIcon className="w-4 h-4" />
                </label>

                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="hidden sm:block text-xs bg-white/90 border border-gray-200 rounded-full px-3 py-1 text-gray-600"
                >
                  <option value="public">Public</option>
                  <option value="followers">Only followers</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-primary-600 text-white px-6 py-2 rounded-full shadow-[0_12px_25px_rgba(67,56,202,0.25)] hover:bg-primary-700 transition"
              >
                {loading || uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader label="" size={16} />
                    Publishing...
                  </span>
                ) : (
                  "Publish"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;
