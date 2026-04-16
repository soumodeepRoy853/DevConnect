"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaRetweet } from "react-icons/fa";
import { MessageCircle, Share2, MoreHorizontal, Bookmark, BookmarkCheck, Pencil, Image as ImageIcon, X } from "lucide-react";
import api from "../services/api";

const formatRelativeTime = (value) => {
  if (!value) return "";
  const now = Date.now();
  const then = new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.floor((now - then) / 60000));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const splitPostText = (text) => {
  if (!text) return { before: "", code: "", after: "" };
  const fence = "```";
  const start = text.indexOf(fence);
  if (start === -1) return { before: text, code: "", after: "" };
  const end = text.indexOf(fence, start + fence.length);
  if (end === -1) return { before: text, code: "", after: "" };

  const before = text.slice(0, start).trim();
  const rawCode = text.slice(start + fence.length, end).trim();
  const after = text.slice(end + fence.length).trim();
  const codeLines = rawCode.split("\n");
  const firstLine = codeLines[0]?.trim();
  const code = (codeLines.length > 1 && /^[a-z]+$/i.test(firstLine))
    ? codeLines.slice(1).join("\n")
    : rawCode;

  return { before, code, after };
};

const PostCard = ({
  post,
  onLike = () => {},
  onDelete = () => {},
  onCommentSubmit = () => {},
  onRepost = () => {},
  onSave = () => {},
  onEdit = () => {},
  showDelete = true,
}) => {
  const { auth } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draftText, setDraftText] = useState(post.text || "");
  const [draftImage, setDraftImage] = useState(null);
  const [draftPreview, setDraftPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const isOwner = post.user?._id === auth.user?.id;
  const commentCount = post.comments?.length || 0;
  const hasLiked = Boolean(
    auth.user?.id &&
      post.likes?.some((like) => {
        const likeId = like?._id || like;
        return likeId && likeId.toString() === auth.user?.id;
      })
  );
  const timeLabel = formatRelativeTime(post.createdAt);
  const titleLabel = post.user?.title || post.user?.role || "Member";
  const { before, code, after } = splitPostText(post.text);

  useEffect(() => {
    if (!draftImage) {
      setDraftPreview(null);
      return;
    }
    const url = URL.createObjectURL(draftImage);
    setDraftPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [draftImage]);

  const handleEditSave = async () => {
    setSavingEdit(true);
    try {
      let imageUrl;
      if (draftImage) {
        const formData = new FormData();
        formData.append("image", draftImage);
        const res = await api.post("/upload/post", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = res.data.url;
      }

      await onEdit(post._id, {
        text: draftText,
        image: imageUrl,
        removeImage,
      });
      setIsEditing(false);
      setDraftImage(null);
      setRemoveImage(false);
    } catch {
      // No-op
    } finally {
      setSavingEdit(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "DevConnect Post", url });
      } catch {
        // No-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert("Post link copied.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 shadow-sm p-5 mb-4 rounded-2xl border border-white/80 hover:shadow-lg transition"
    >
      {/* Author */}
      <div className="flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          <img
            src={post.user?.avatar || "/default-avatar.svg"}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover border border-white/70"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/default-avatar.svg";
            }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.user?.name || "Unknown"}
            </h3>
            <p className="text-xs text-gray-500">
                {titleLabel}
                {timeLabel && <span className="ml-2">- {timeLabel}</span>}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              aria-label="Post options"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        )}

        {menuOpen && isOwner && (
          <div className="absolute right-0 top-10 z-10 w-40 rounded-xl border border-gray-100 bg-white shadow-lg p-2 text-sm">
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setDraftText(post.text || "");
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            )}
            {isOwner && showDelete && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(post._id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-left text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Text */}
      {/* If this is a repost, show original post inside a small card */}
      <div className="mt-4 space-y-3 text-gray-700">
        {isEditing && !post.repostOf ? (
          <div className="space-y-3">
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700"
              rows={4}
            />
            {(post.image || draftPreview) && (
              <div className="relative">
                <img
                  src={draftPreview || post.image}
                  alt="preview"
                  className="w-full rounded-2xl max-h-[300px] object-cover border border-white/70"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-post.svg";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setRemoveImage(true);
                    setDraftImage(null);
                  }}
                  className="absolute top-3 right-3 bg-white/90 text-xs px-3 py-1 rounded-full hover:bg-white flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    setDraftImage(e.target.files?.[0] || null);
                    setRemoveImage(false);
                  }}
                />
                Replace image
              </label>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setDraftImage(null);
                  setRemoveImage(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={savingEdit}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
        {post.repostOf && post.repostOf.user ? (
          <div className="border border-white/80 rounded-2xl p-4 bg-gray-50">
            <div className="flex items-center mb-2">
              <img
                src={post.repostOf.user?.avatar || "/default-avatar.svg"}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border mr-3"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.svg";
                }}
              />
              <div>
                <h4 className="font-semibold text-gray-800">
                  {post.repostOf.user?.name || "Unknown"}
                </h4>
                <p className="text-xs text-gray-500">
                  {formatRelativeTime(post.repostOf.createdAt)}
                </p>
              </div>
            </div>

            {post.repostOf.text && (
              <p className="text-gray-800 whitespace-pre-line">
                {post.repostOf.text}
              </p>
            )}

            {post.repostOf.image && (
              <img
                src={post.repostOf.image}
                alt="original-post"
                className="w-full rounded-2xl mt-3 max-h-[300px] object-cover border border-white/70"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-post.svg";
                }}
              />
            )}
          </div>
        ) : (
          <>
            {before && <p className="whitespace-pre-line">{before}</p>}
            {code && (
              <pre className="rounded-2xl bg-[#111111] text-[#d9ddff] p-4 text-sm overflow-auto">
                <code>{code}</code>
              </pre>
            )}
            {after && <p className="whitespace-pre-line">{after}</p>}
          </>
        )}
          </>
        )}
      </div>

      {/* Image */}
      {post.image && !isEditing && (
        <img
          src={post.image}
          alt="post"
          className="w-full rounded-2xl mt-4 max-h-[500px] object-cover border border-white/70"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/default-post.svg";
          }}
        />
      )}

      {/* Like and delete */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post._id)}
            className="flex items-center gap-2 hover:text-red-500 transition"
            title="Like"
          >
            {hasLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            <span>{post.likes?.length || 0}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-2 hover:text-primary-600 transition"
            title="Comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </button>

          <button
            onClick={() => {
              const originalId = post.repostOf && (post.repostOf._id || post.repostOf) ? (post.repostOf._id || post.repostOf) : post._id;
              onRepost(originalId, Boolean(post.isRepostedByViewer));
            }}
            className={`flex items-center gap-2 transition ${post.isRepostedByViewer ? "text-primary-600" : "hover:text-primary-600"}`}
            title={post.repostCount ? `${post.repostCount} repost(s)` : "Be the first to repost"}
          >
            <FaRetweet />
            <span>{post.repostCount || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSave(post._id)}
            className="hover:text-primary-600"
            title={post.isSavedByViewer ? "Saved" : "Save"}
          >
            {post.isSavedByViewer ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button type="button" onClick={handleShare} className="hover:text-primary-600" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comment section */}
      {showComments && (
        <div className="mt-4">
          {post.comments?.map((c) => (
            <div key={c._id} className="text-xs text-gray-600 border-b border-gray-100 py-2">
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
              className="mt-3 px-4 py-2 text-sm w-full rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;
