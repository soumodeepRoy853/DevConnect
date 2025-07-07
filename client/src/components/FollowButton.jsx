import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";
import { motion } from "framer-motion";

const FollowButton = ({ userId, onFollowChange }) => {
  const { auth } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); //Prevent spamming

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/follow/${auth.user.id}/follow-data`,
          {
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );
        const followingIds = res.data.following.map((u) => u._id);
        setIsFollowing(followingIds.includes(userId));
      } catch (err) {
        console.error("Error fetching follow status", err);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user?.id !== userId) {
      fetchFollowData();
    }
  }, [auth, userId]);

  const handleToggleFollow = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const endpoint = isFollowing ? "unfollow" : "follow-user";
      await axios.put(
        `${import.meta.env.VITE_API_URL}/follow/${endpoint}/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      setIsFollowing(!isFollowing);
      onFollowChange && onFollowChange();
    } catch (err) {
    //   console.error("Follow/Unfollow error", err);
    } finally {
      setActionLoading(false); // Re-enable button
    }
  };

  if (auth?.user?.id === userId || loading) return null;

  return (
    <motion.button
      onClick={handleToggleFollow}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      disabled={actionLoading}
      className={`px-4 py-2 rounded font-semibold transition-all text-white ${
        isFollowing
          ? "bg-red-500 hover:bg-red-600"
          : "bg-blue-500 hover:bg-blue-600"
      } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {actionLoading ? "Please wait..." : isFollowing ? "Unfollow" : "Follow"}
    </motion.button>
  );
};

export default FollowButton;
