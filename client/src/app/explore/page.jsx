"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import RequireAuth from "../../components/RequireAuth";
import Loader from "../../components/Loader";
import MobileBottomNav from "../../components/MobileBottomNav";
import api from "../../services/api";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";

const ExplorePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Creators");
  const [sortKey, setSortKey] = useState("relevance");
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
      const raw = res.data.user.following || [];
      const ids = raw.map((u) => String(u?._id || u)).filter(Boolean);
      setFollowingIds(ids);
    } catch {
      // No-op
    }
  };

  const handleFollow = async (targetUserId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.put(`/follow/unfollow/${targetUserId}`, {});
        setFollowingIds((prev) => prev.filter((id) => String(id) !== String(targetUserId)));
      } else {
        await api.put(`/user/follow/${targetUserId}`, {});
        setFollowingIds((prev) => [...prev, String(targetUserId)]);
      }
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isActiveToday = (lastSeen) => {
    if (!lastSeen) return false;
    const last = new Date(lastSeen).getTime();
    const now = Date.now();
    return now - last <= 24 * 60 * 60 * 1000;
  };

  const activeTodayCount = useMemo(() => {
    const active = profiles.filter((p) => isActiveToday(p.user?.lastSeen)).length;
    return active || profiles.length;
  }, [profiles]);

  const filterOptions = useMemo(() => {
    const skillCounts = {};
    const displayMap = {};
    profiles.forEach((profile) => {
      (profile.skills || []).forEach((skill) => {
        const raw = String(skill || "").trim();
        if (!raw) return;
        const key = raw.toLowerCase();
        skillCounts[key] = (skillCounts[key] || 0) + 1;
        if (!displayMap[key]) displayMap[key] = raw;
      });
    });
    const sorted = Object.keys(skillCounts)
      .sort((a, b) => skillCounts[b] - skillCounts[a])
      .slice(0, 4)
      .map((key) => displayMap[key]);
    return ["All Creators", ...sorted];
  }, [profiles]);

  useEffect(() => {
    if (!filterOptions.includes(activeFilter)) {
      setActiveFilter("All Creators");
    }
  }, [filterOptions, activeFilter]);

  const toggleSort = () => {
    setSortKey((prev) => {
      if (prev === "relevance") return "recent";
      if (prev === "recent") return "name";
      return "relevance";
    });
  };

  const filteredProfiles = useMemo(() => {
    const filterKey = activeFilter.toLowerCase();
    const withScore = profiles.map((profile) => {
      const name = profile.user?.name || "";
      const bio = profile.bio || "";
      const education = profile.education || "";
      const location = profile.location || "";
      const skills = profile.skills || [];
      const haystack = [name, bio, education, location, ...skills].join(" ").toLowerCase();
      let score = 0;

      if (normalizedQuery) {
        if (name.toLowerCase().includes(normalizedQuery)) score += 3;
        if (skills.some((s) => String(s).toLowerCase().includes(normalizedQuery))) score += 2;
        if (bio.toLowerCase().includes(normalizedQuery) || education.toLowerCase().includes(normalizedQuery)) score += 1;
        if (!haystack.includes(normalizedQuery)) score = 0;
      }

      const filterMatch = filterKey === "all creators" ? true : (
        skills.some((s) => String(s).toLowerCase().includes(filterKey)) ||
        bio.toLowerCase().includes(filterKey) ||
        education.toLowerCase().includes(filterKey)
      );

      return { profile, score, filterMatch };
    });

    let filtered = withScore.filter((item) => item.filterMatch);
    if (normalizedQuery) {
      filtered = filtered.filter((item) => item.score > 0);
    }

    const getFollowersCount = (p) => (p.user?.followers || []).length;

    filtered.sort((a, b) => {
      if (sortKey === "recent") {
        const aTime = new Date(a.profile.user?.lastSeen || 0).getTime();
        const bTime = new Date(b.profile.user?.lastSeen || 0).getTime();
        return bTime - aTime;
      }
      if (sortKey === "name") {
        return (a.profile.user?.name || "").localeCompare(b.profile.user?.name || "");
      }
      // relevance
      if (b.score !== a.score) return b.score - a.score;
      return getFollowersCount(b.profile) - getFollowersCount(a.profile);
    });

    const result = filtered.map((item) => item.profile);
    return result.filter((profile) => String(profile.user?._id) !== String(auth?.user?.id));
  }, [profiles, activeFilter, normalizedQuery, sortKey, auth?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader label="Loading" />
      </div>
    );
  }
  if (error) return <div className="text-center text-red-500 mt-20">{error}</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <div className="max-w-[1200px] mx-auto px-4 pt-4 lg:pt-8">
        {/* Search Bar & Filters Header Layout */}
        <div className="max-w-[800px] mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6 shadow-sm rounded-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for talent, stacks, or proj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f4f4f5] lg:bg-white rounded-2xl py-3.5 pl-12 pr-12 text-[15px] outline-none placeholder:text-gray-500 lg:border lg:border-gray-200"
            />
            <div className="absolute inset-y-0 right-4 flex items-center text-primary-600">
              <button
                type="button"
                onClick={toggleSort}
                title={`Sort: ${sortKey}`}
                className="hover:text-primary-700"
                aria-label="Toggle sort"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                  activeFilter === filter
                    ? "bg-[#3e53d7] text-white shadow-[0_4px_12px_rgba(62,83,215,0.25)]"
                    : "bg-[#f4f4f5] lg:bg-white lg:border lg:border-gray-200 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <h1 className="text-[28px] lg:text-[34px] font-bold text-gray-900 leading-tight">
              Discover
              <span className="inline sm:block ml-2 sm:ml-0">Talent</span>
            </h1>
            <p className="text-[14px] lg:text-[15px] text-gray-500 font-medium sm:max-w-[140px] lg:max-w-[160px] leading-snug sm:pb-1">
              {activeTodayCount} Developers active today
            </p>
          </div>
        </div>

        {/* Profiles List */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-[1200px] mx-auto">
          {filteredProfiles.map((profile) => {
            const userId = profile.user._id;
            const isSelf = auth?.user?.id === userId;
            const isFollowing = followingIds.includes(String(userId));
            const followerList = profile.user?.followers || [];
            const visibleFollowers = followerList.slice(0, 2);
            const remainingFollowers = Math.max(0, followerList.length - visibleFollowers.length);

            return (
              <div
                key={profile._id}
                className="bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0 cursor-pointer" onClick={() => router.push(`/profile/${userId}`)}>
                    <img
                      src={profile.avatar || "/default-avatar.svg"}
                      alt={profile.user.name}
                      className="w-[84px] h-[84px] rounded-[20px] object-cover bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-[18px] h-[18px] bg-emerald-400 border-[3px] border-white rounded-full"></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 mt-1">
                    <h3 className="text-[18px] font-bold text-gray-900 leading-tight mb-1 cursor-pointer hover:underline" onClick={() => router.push(`/profile/${userId}`)}>
                      {profile.user.name}
                    </h3>
                    <p className="text-[14px] text-gray-600 leading-snug mb-3">
                      {profile.education || profile.bio || "Software Engineer"}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-[#dcf0f9] text-[#1c647c] px-3 py-1 rounded-[10px] text-[10px] font-bold uppercase tracking-wider"
                        >
                          {skill}
                        </span>
                      ))}
                      {!profile.skills?.length && (
                        <span className="bg-[#dcf0f9] text-[#1c647c] px-3 py-1 rounded-[10px] text-[10px] font-bold uppercase tracking-wider">
                          Developer
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between mt-6">
                  {/* Connections */}
                  <div className="flex items-center">
                    {visibleFollowers.length > 0 ? (
                      <>
                        {visibleFollowers.map((f, j) => (
                          <img
                            key={String(f._id || j)}
                            src={f?.avatar || "/default-avatar.svg"}
                            alt={f?.name || "Follower"}
                            className={`w-8 h-8 rounded-full border-2 border-white object-cover ${j > 0 ? "-ml-2" : ""}`}
                          />
                        ))}
                        {remainingFollowers > 0 && (
                          <div className="w-8 h-8 -ml-2 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold bg-[#8692a6] text-white">
                            +{remainingFollowers}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[12px] text-gray-400">No followers yet</div>
                    )}
                  </div>

                  {/* Follow Button */}
                  {!isSelf && (
                    <button
                      onClick={() => handleFollow(userId, isFollowing)}
                      disabled={isFollowing}
                      className={`px-8 py-2.5 rounded-[12px] font-bold text-[14px] transition-all shadow-md ${
                        isFollowing
                          ? "bg-gray-100 text-gray-500 shadow-none border border-gray-200"
                          : "bg-[#3e53d7] text-white hover:bg-[#3144c2] shadow-[0_4px_12px_rgba(62,83,215,0.25)]"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                  {isSelf && (
                    <button
                      onClick={() => router.push(`/edit-profile`)}
                      className="px-8 py-2.5 rounded-[12px] font-bold text-[14px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all border border-gray-200"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand Network Footer */}
        <div className="mt-12 bg-[#f8f9fe] rounded-[32px] p-8 text-center pb-12 mb-10 max-w-[800px] mx-auto border border-blue-50/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#3e53d7] mb-4">
            EXPAND YOUR NETWORK
          </p>
          <h2 className="text-[26px] lg:text-[32px] font-bold text-gray-900 leading-tight mb-4">
            Don't see who<br className="sm:hidden" /> you're looking<br className="sm:hidden" /> for?
          </h2>
          <p className="text-[14px] lg:text-[15px] text-gray-500 leading-relaxed mb-6 px-2 lg:max-w-md mx-auto">
            Try refining your search filters or explore recent contributors in the feed.
          </p>
          <button className="text-[15px] font-bold text-[#3e53d7] flex items-center justify-center gap-2 mx-auto hover:text-[#3144c2] transition-colors group">
            Browse top rated contributors
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <MobileBottomNav />
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
