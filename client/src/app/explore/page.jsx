"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import RequireAuth from "../../components/RequireAuth";
import api from "../../services/api";

const ExplorePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { auth } = useAuth();
  const router = useRouter();

  const fetchProfiles = async () => {
    try {
      const res = await api.get("/profile/all-profiles");
      setProfiles(res.data.profiles || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profiles.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await api.get("/user/all-users");
      setFollowingIds(res.data.user.following || []);
    } catch {
      // No-op
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await api.put(`/user/follow/${targetUserId}`, {});
      setFollowingIds((prev) => [...prev, targetUserId]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to follow user.");
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchProfiles();
      fetchFollowing();
    }
  }, [auth?.token]);

  if (loading) return <div className="text-center mt-20">Loading profiles...</div>;
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;
  if (profiles.length === 0) {
    return <div className="text-center text-gray-600 mt-20">No profiles found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <h2 className="text-2xl font-bold text-center mb-8">Developer Community</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => {
          const userId = profile.user._id;
          const isSelf = auth?.user?.id === userId;
          const isFollowing = followingIds.includes(userId);

          return (
            <div key={profile._id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center">
              <img
                src={profile.avatar || "/default-avatar.svg"}
                alt="avatar"
                className="w-20 h-20 rounded-full mb-4 border"
              />
              <h3 className="text-lg font-semibold">{profile.user.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{profile.user.email}</p>
              {profile.bio && <p className="text-sm text-gray-700 italic mb-2">{profile.bio}</p>}

              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {profile.skills?.slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => router.push(`/profile/${userId}`)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  View Profile
                </button>
                {!isSelf && (
                  <button
                    onClick={() => handleFollow(userId)}
                    className={`text-sm px-3 py-1 rounded ${
                      isFollowing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                    disabled={isFollowing}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <RequireAuth>
      <ExplorePage />
    </RequireAuth>
  );
};

export default Page;
