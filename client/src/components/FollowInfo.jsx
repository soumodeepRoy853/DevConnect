import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";

const FollowInfo = ({ userId, refreshTrigger = 0 }) => {
  const [followData, setFollowData] = useState({
    followers: [],
    following: [],
  });

  const { auth } = useAuth(); // 🔐 Get auth token

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/follow/${userId}/follow-data`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`, // Include auth token
            },
          }
        );
        setFollowData(res.data);
      } catch (err) {
        console.error("Failed to load follow data", err);
      }
    };

    fetchFollowData();
  }, [userId, refreshTrigger, auth.token]); // 👈 refetch when token or refreshTrigger changes

  return (
    <div className="mb-4 flex gap-4 text-sm text-gray-700">
      <p>
        <strong>{followData.followers?.length || 0}</strong> Followers
      </p>
      <p>
        <strong>{followData.following?.length || 0}</strong> Following
      </p>
    </div>
  );
};

export default FollowInfo;
