import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext";
import CommentSection from "../components/CommentSection";

const PostPage = () => {
  const { postId } = useParams();
  const { auth } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/post/all-posts`);
        const found = res.data.find((p) => p._id === postId);
        if (!found) return setError("Post not found.");
        setPost(found);
      } catch (err) {
        setError("Error fetching post.");
      }
    };
    fetchPost();
  }, [postId]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!post) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold">{post.user.name}</h2>
        <p className="mt-2 text-gray-700">{post.text}</p>
        {post.image && <img src={post.image} className="mt-4 rounded" />}
        <div className="mt-2 text-sm text-gray-500">
          {post.likes.length} Likes · {post.comments.length} Comments
        </div>
      </div>

      <CommentSection postId={postId} comments={post.comments} />
    </div>
  );
};

export default PostPage;
