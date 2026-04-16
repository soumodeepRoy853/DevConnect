"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RequireAuth from "../../../components/RequireAuth";
import Loader from "../../../components/Loader";
import CommentSection from "../../../components/CommentSection";
import api from "../../../services/api";

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get("/post/feed");
        const posts = res.data.posts || [];
        const found = posts.find((p) => p._id === postId);
        if (!found) return setError("Post not found.");
        setPost(found);
      } catch {
        setError("Error fetching post.");
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!post) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader label="Loading" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold">{post.user?.name || "Unknown"}</h2>
        <p className="mt-2 text-gray-700">{post.text}</p>
        {post.image && (
          <img
            src={post.image}
            className="mt-4 rounded"
            alt="post"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-post.svg";
            }}
          />
        )}
        <div className="mt-2 text-sm text-gray-500">
          {post.likes?.length || 0} Likes - {post.comments?.length || 0} Comments
        </div>
      </div>

      <CommentSection postId={postId} comments={post.comments || []} />
    </div>
  );
};

const Page = () => {
  return (
    <RequireAuth>
      <PostPage />
    </RequireAuth>
  );
};

export default Page;
