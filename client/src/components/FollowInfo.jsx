"use client";

import React, { useEffect, useState } from "react";
import api from "../services/api";

const FollowInfo = ({ userId, refreshTrigger = 0 }) => {
  const [followData, setFollowData] = useState({
    followers: [],
    following: [],
  });

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const res = await api.get(`/follow/${userId}/follow-data`);
        setFollowData(res.data);
      } catch (err) {
        console.error("Failed to load follow data", err);
      }
    };

    if (userId) {
      fetchFollowData();
    }
  }, [userId, refreshTrigger]);

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
