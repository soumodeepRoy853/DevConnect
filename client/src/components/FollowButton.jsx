"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";
import api from "../services/api";

const FollowButton = ({ userId, onFollowChange }) => {
  const { auth } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); //Prevent spamming

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const res = await api.get(`/follow/${auth.user.id}/follow-data`);
        const followingIds = res.data.following.map((u) => u._id);
        setIsFollowing(followingIds.includes(userId));
      } catch (err) {
        console.error("Error fetching follow status", err);
      } finally {
        setLoading(false);
      }
    };

    if (!auth?.user?.id || auth?.user?.id === userId) return;
    fetchFollowData();
  }, [auth?.user?.id, userId]);

  const handleToggleFollow = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const endpoint = isFollowing ? "unfollow" : "follow-user";
      await api.put(`/follow/${endpoint}/${userId}`, {});
      setIsFollowing(!isFollowing);
      onFollowChange && onFollowChange();
    } catch (err) {
    //   console.error("Follow/Unfollow error", err);
    } finally {
      setActionLoading(false); // Re-enable button
    }
  };

  if (!auth?.user?.id || auth?.user?.id === userId || loading) return null;

  return (
    <motion.button
      onClick={handleToggleFollow}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      disabled={actionLoading}
      className={`px-4 py-2 rounded font-semibold transition-all text-white ${
          isFollowing
            ? "bg-red-500 hover:bg-red-600"
            : "bg-primary-500 hover:bg-primary-600"
      } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {actionLoading ? "Please wait..." : isFollowing ? "Unfollow" : "Follow"}
    </motion.button>
  );
};

export default FollowButton;
