import React from "react";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";

const PostCard = ({
  post,
  onLike = () => {},
  onDelete = () => {},
  onCommentSubmit = () => {},
  showDelete = true,
}) => {
  const { auth } = useAuth();
  const isOwner = post.user?._id === auth.user?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow p-4 mb-4 rounded-md border border-gray-100"
    >
      {/* 🧑 Author */}
      <div className="flex items-center mb-3">
        <img
          src={post.user?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border mr-3"
        />
        <div>
          <h3 className="font-semibold text-gray-800">
            {post.user?.name || "Unknown"}
          </h3>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 📝 Text */}
      {post.text && (
        <p className="text-gray-800 mb-3 whitespace-pre-line">{post.text}</p>
      )}

      {/* 🖼️ Image */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full rounded-lg mb-3 max-h-[400px] object-cover border"
        />
      )}

      {/* ❤️ Like & 🗑 Delete */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <button
          onClick={() => onLike(post._id)}
          className="flex items-center gap-1 hover:text-red-500 transition"
        >
          {post.likes?.some((like) => like.user === auth.user.id) ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart />
          )}
          <span>{post.likes?.length || 0}</span>
        </button>

        {isOwner && showDelete && (
          <button
            onClick={() => onDelete(post._id)}
            className="flex items-center gap-1 text-red-500 hover:underline"
          >
            <FaTrash /> Delete
          </button>
        )}
      </div>

      {/* 💬 Comment section */}
      <div className="mt-4">
        <strong className="text-sm text-gray-800">Comments:</strong>
        {post.comments?.map((c) => (
          <div key={c._id} className="text-xs text-gray-600 border-b py-1">
            {c.text}
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const comment = e.target.comment.value;
            if (!comment.trim()) return;
            onCommentSubmit(post._id, comment);
            e.target.reset();
          }}
        >
          <input
            name="comment"
            placeholder="Write a comment..."
            className="mt-2 px-2 py-1 text-sm w-full border rounded"
          />
        </form>
      </div>
    </motion.div>
  );
};

export default PostCard;
