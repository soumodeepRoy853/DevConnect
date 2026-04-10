"use client";

import React from "react";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaTrash, FaRetweet } from "react-icons/fa";

const PostCard = ({
  post,
  onLike = () => {},
  onDelete = () => {},
  onCommentSubmit = () => {},
  onRepost = () => {},
  showDelete = true,
}) => {
  const { auth } = useAuth();
  const isOwner = post.user?._id === auth.user?.id;
  const hasLiked = Boolean(
    auth.user?.id &&
      post.likes?.some((like) => {
        const likeId = like?._id || like;
        return likeId && likeId.toString() === auth.user?.id;
      })
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm p-4 mb-4 rounded-xl border border-gray-100 hover:shadow-lg transition transform hover:-translate-y-1"
    >
      {/* Author */}
      <div className="flex items-center mb-3">
        <img
          src={post.user?.avatar || "/default-avatar.svg"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover border mr-3"
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

      {/* Text */}
      {/* If this is a repost, show original post inside a small card */}
      {post.repostOf && post.repostOf.user ? (
        <div className="border rounded p-3 mb-3 bg-gray-50">
          <div className="flex items-center mb-2">
              <img
                src={post.repostOf.user?.avatar || "/default-avatar.svg"}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover border mr-3"
              />
            <div>
              <h4 className="font-semibold text-gray-700">
                {post.repostOf.user?.name || "Unknown"}
              </h4>
              <p className="text-xs text-gray-500">
                {new Date(post.repostOf.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {post.repostOf.text && (
            <p className="text-gray-800 mb-2 whitespace-pre-line">
              {post.repostOf.text}
            </p>
          )}

          {post.repostOf.image && (
            <img
                src={post.repostOf.image}
                alt="original-post"
                className="w-full rounded-lg mb-2 max-h-[300px] object-cover border"
              />
          )}
        </div>
      ) : (
        post.text && (
          <p className="text-gray-800 mb-3 whitespace-pre-line">{post.text}</p>
        )
      )}

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="w-full rounded-xl mb-3 max-h-[500px] object-cover border"
        />
      )}

      {/* Like and delete */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onLike(post._id)}
            className="flex items-center gap-1 hover:text-red-500 transition"
          >
            {hasLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            <span>{post.likes?.length || 0}</span>
          </button>

          <button
            onClick={() => {
              const originalId = post.repostOf && (post.repostOf._id || post.repostOf) ? (post.repostOf._id || post.repostOf) : post._id;
              onRepost(originalId, Boolean(post.isRepostedByViewer));
            }}
            className={`flex items-center gap-1 transition ${post.isRepostedByViewer ? "text-primary-600" : "hover:text-primary-600"}`}
            title={post.repostCount ? `${post.repostCount} repost(s)` : "Be the first to repost"}
          >
            <FaRetweet />
            <span>{post.isRepostedByViewer ? "Undo Repost" : "Repost"}</span>
            <span className="ml-1 text-xs text-gray-500">{post.repostCount || 0}</span>
          </button>
        </div>

        {isOwner && showDelete && (
          <button
            onClick={() => onDelete(post._id)}
            className="flex items-center gap-1 text-red-500 hover:underline"
          >
            <FaTrash /> Delete
          </button>
        )}
      </div>

      {/* Comment section */}
      <div className="mt-4">
        <strong className="text-sm text-gray-800">Comments:</strong>
        {post.comments?.map((c) => (
          <div key={c._id} className="text-xs text-gray-600 border-b py-1">
            <span className="font-semibold">
              {c.user?.name || "User"}:
            </span>{" "}
            <span>{c.text}</span>
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
