"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RequireAuth from "../../components/RequireAuth";
import { useAuth } from "../../context/authContext";
import api from "../../services/api";
import Loader from "../../components/Loader";
import MobileBottomNav from "../../components/MobileBottomNav";
import { Briefcase, Code2, Image as ImageIcon, Link2, MessageSquare, Plus, Share2, Lock, Globe } from "lucide-react";

const TYPE_CONFIG = {
  chat: { label: "Chat", Icon: MessageSquare },
  job: { label: "Job", Icon: Briefcase },
  snippet: { label: "Snippet", Icon: Code2 },
  photo: { label: "Photo", Icon: ImageIcon },
  link: { label: "Link", Icon: Link2 },
};

const CommunityPage = () => {
  const { auth, isAuthReady } = useAuth();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("c");
  const [communities, setCommunities] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState("");
  const [postSubmitError, setPostSubmitError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [messageSubmitError, setMessageSubmitError] = useState("");
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [type, setType] = useState("chat");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [code, setCode] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [chatText, setChatText] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createVisibility, setCreateVisibility] = useState("public");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [slugLoaded, setSlugLoaded] = useState(false);
  const [communityQuery, setCommunityQuery] = useState("");

  const activeCommunity = useMemo(
    () => communities.find((c) => String(c._id) === String(activeId)) || null,
    [communities, activeId]
  );

  const filteredCommunities = useMemo(() => {
    if (!communityQuery.trim()) return communities;
    const q = communityQuery.trim().toLowerCase();
    return communities.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const description = (c.description || "").toLowerCase();
      return name.includes(q) || description.includes(q);
    });
  }, [communities, communityQuery]);

  const isMember = Boolean(activeCommunity?.isMember);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/community");
      const items = res.data.communities || [];
      setCommunities(items);
      if (items.length > 0 && !activeId) {
        setActiveId(String(items[0]._id));
      }
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (communityId) => {
    if (!communityId) return;
    setPostError("");
    try {
      const res = await api.get(`/community/${communityId}/posts`);
      setPosts(res.data.posts || []);
    } catch (err) {
      setPosts([]);
      setPostError(err.response?.data?.message || "Unable to load posts.");
    }
  };

  const fetchMessages = async (communityId) => {
    if (!communityId) return;
    setMessageError("");
    try {
      const res = await api.get(`/community/${communityId}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      setMessages([]);
      setMessageError(err.response?.data?.message || "Unable to load messages.");
    }
  };

  const fetchCommunityBySlug = async (slug) => {
    if (!slug) return;
    try {
      const res = await api.get(`/community/slug/${slug}`);
      const community = res.data.community;
      if (!community) return;
      setCommunities((prev) => {
        const exists = prev.some((c) => String(c._id) === String(community._id));
        return exists ? prev : [community, ...prev];
      });
      setActiveId(String(community._id));
    } catch {
      // No-op
    }
  };

  useEffect(() => {
    if (!isAuthReady || !auth?.token) return;
    fetchCommunities();
  }, [isAuthReady, auth?.token]);

  useEffect(() => {
    if (!selectedSlug) return;
    const existing = communities.find((c) => c.slug === selectedSlug);
    if (existing) {
      setActiveId(String(existing._id));
      return;
    }
    if (!slugLoaded) {
      setSlugLoaded(true);
      fetchCommunityBySlug(selectedSlug);
    }
  }, [selectedSlug, communities, slugLoaded]);

  useEffect(() => {
    if (!activeId) return;
    fetchPosts(activeId);
    fetchMessages(activeId);
  }, [activeId]);

  const resetInputs = () => {
    setText("");
    setLink("");
    setCode("");
    setPhotoUrl("");
    setPhotoFile(null);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setPostSubmitError("");
    if (!activeId) {
      setPostSubmitError("Select a community before posting.");
      return;
    }
    if (!text && !link && !code && !photoUrl && !photoFile) {
      setPostSubmitError("Add some content to your post.");
      return;
    }

    setPosting(true);
    try {
      let imageUrl = photoUrl;
      if (photoFile) {
        const formData = new FormData();
        formData.append("image", photoFile);
        const upload = await api.post("/upload/post", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = upload.data.url;
      }

      const payload = {
        type,
        text: text.trim(),
        link: link.trim(),
        code: code.trim(),
        image: imageUrl,
        job: type === "job" ? { title: text.trim(), company: "", location: "" } : undefined,
      };

      const res = await api.post(`/community/${activeId}/posts`, payload);
      setPosts((prev) => [res.data.post, ...prev]);
      resetInputs();
      setPostSubmitError("");
    } catch (err) {
      setPostSubmitError(err.response?.data?.message || "Failed to post in community.");
    } finally {
      setPosting(false);
    }
  };

  const handleJoinToggle = async () => {
    if (!activeId) return;
    setJoining(true);
    try {
      if (isMember) {
        await api.post(`/community/${activeId}/leave`);
      } else {
        await api.post(`/community/${activeId}/join`);
      }
      await fetchCommunities();
      await fetchPosts(activeId);
      await fetchMessages(activeId);
    } finally {
      setJoining(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    setCreateError("");

    try {
      const payload = {
        name: createName.trim(),
        description: createDescription.trim(),
        visibility: createVisibility,
      };
      let res;
      try {
        res = await api.post("/community", payload);
      } catch (err) {
        if (err?.response?.status === 404) {
          res = await api.post("/community/create", payload);
        } else {
          throw err;
        }
      }
      const community = res.data.community;
      if (community) {
        const enriched = {
          ...community,
          isMember: true,
          memberCount: community.memberCount || 1,
        };
        setCommunities((prev) => [enriched, ...prev]);
        setActiveId(String(community._id));
      }
      setShowCreate(false);
      setCreateName("");
      setCreateDescription("");
      setCreateVisibility("public");
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create community.");
    } finally {
      setCreating(false);
    }
  };

  const handleShareCommunity = async () => {
    if (!activeCommunity?.slug) return;
    const url = `${window.location.origin}/community?c=${activeCommunity.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: activeCommunity.name, url });
      } catch {
        // No-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      alert("Community link copied.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setMessageSubmitError("");
    if (!activeId) {
      setMessageSubmitError("Select a community before sending a message.");
      return;
    }
    if (!chatText.trim()) {
      setMessageSubmitError("Type a message first.");
      return;
    }
    try {
      const res = await api.post(`/community/${activeId}/messages`, { text: chatText.trim() });
      setMessages((prev) => [...prev, res.data.message]);
      setChatText("");
      setMessageSubmitError("");
    } catch (err) {
      setMessageSubmitError(err.response?.data?.message || "Failed to send message.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <p className="text-sm text-gray-500">Join channels, share jobs, snippets, photos, and links.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreate((prev) => !prev)}
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create
              </span>
            </button>
            {activeCommunity && (
              <>
                <button
                  type="button"
                  onClick={handleShareCommunity}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600"
                >
                  <span className="inline-flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleJoinToggle}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    isMember ? "bg-gray-100 text-gray-600" : "bg-primary-600 text-white"
                  }`}
                >
                  {joining ? "Updating..." : isMember ? "Leave" : "Join"}
                </button>
              </>
            )}
          </div>
        </div>

        {showCreate && (
          <form onSubmit={handleCreateCommunity} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500">COMMUNITY NAME</label>
              <input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. React Builders"
                className="w-full bg-[#f4f4f5] rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-500">DESCRIPTION</label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="What is this community about?"
                className="w-full bg-[#f4f4f5] rounded-xl p-3 text-sm outline-none"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-500">VISIBILITY</label>
              <select
                value={createVisibility}
                onChange={(e) => setCreateVisibility(e.target.value)}
                className="bg-[#f4f4f5] rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                {createVisibility === "private" ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {createVisibility === "private" ? "Invite-only" : "Visible to everyone"}
              </div>
            </div>
            {createError && <div className="text-xs text-red-600">{createError}</div>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Community"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-10">
            <Loader label="Loading" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={communityQuery}
                onChange={(e) => setCommunityQuery(e.target.value)}
                placeholder="Search communities..."
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {filteredCommunities.length === 0 ? (
                <div className="text-sm text-gray-500 px-2">No communities available yet.</div>
              ) : (
                filteredCommunities.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setActiveId(String(item._id))}
                    className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold ${
                      String(activeId) === String(item._id)
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-600 border border-gray-100"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {item.name}
                      {item.isAboutBased && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">About</span>}
                      {item.visibility === "private" && <Lock className="w-3 h-3" />}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {isMember ? (
          <form onSubmit={handlePost} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                    type === key ? "bg-primary-50 text-primary-600" : "bg-gray-50 text-gray-500"
                  }`}
                >
                  <cfg.Icon className="w-4 h-4" />
                  {cfg.label}
                </button>
              ))}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share a message with the community..."
              className="w-full bg-[#f4f4f5] rounded-xl p-4 text-sm outline-none"
              rows={3}
            />

            {type === "snippet" && (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code snippet..."
                className="w-full bg-[#111111] text-[#d9ddff] rounded-xl p-4 text-xs font-mono outline-none"
                rows={4}
              />
            )}

            {type === "photo" && (
              <div className="space-y-2">
                <input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste a photo URL"
                  className="w-full bg-[#f4f4f5] rounded-xl p-3 text-sm outline-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
            )}

            {type === "link" && (
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Paste a resource link"
                className="w-full bg-[#f4f4f5] rounded-xl p-3 text-sm outline-none"
              />
            )}

            <button
              type="submit"
              disabled={posting}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-60"
            >
              {posting ? "Posting..." : `Post to ${activeCommunity?.name || "Community"}`}
            </button>
            {postSubmitError && (
              <div className="text-xs text-red-600">{postSubmitError}</div>
            )}
          </form>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="text-sm text-gray-500">Join a community to post.</div>
            {activeCommunity ? (
              <button
                type="button"
                onClick={handleJoinToggle}
                disabled={joining}
                className="self-start bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
              >
                {joining ? "Joining..." : `Join ${activeCommunity.name}`}
              </button>
            ) : (
              <div className="text-xs text-gray-400">Select a community to join.</div>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {postError ? (
              <div className="text-center text-sm text-gray-500 py-8">{postError}</div>
            ) : posts.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">
                No posts yet in {activeCommunity?.name || "this community"}.
              </div>
            ) : (
              posts.map((p) => (
                <div key={p._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.user?.avatar || "/default-avatar.svg"}
                      alt={p.user?.name}
                      className="w-9 h-9 rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{p.user?.name}</div>
                      <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  {p.text && <p className="text-sm text-gray-700">{p.text}</p>}
                  {p.code && (
                    <pre className="rounded-xl bg-[#111111] text-[#d9ddff] p-4 text-xs overflow-auto">
                      <code>{p.code}</code>
                    </pre>
                  )}
                  {p.image && (
                    <img
                      src={p.image}
                      alt="community"
                      className="w-full rounded-xl max-h-80 object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-post.svg";
                      }}
                    />
                  )}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">
                      {p.link}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Community Chat</h3>
              <p className="text-xs text-gray-400">Ask quick questions or share updates.</p>
            </div>
            <div className="flex-1 space-y-3 overflow-auto max-h-[360px]">
              {messageError ? (
                <div className="text-xs text-gray-500">{messageError}</div>
              ) : messages.length === 0 ? (
                <div className="text-xs text-gray-500">No messages yet.</div>
              ) : (
                messages.map((m) => (
                  <div key={m._id} className="flex items-start gap-2">
                    <img
                      src={m.user?.avatar || "/default-avatar.svg"}
                      alt={m.user?.name}
                      className="w-7 h-7 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />
                    <div className="bg-gray-50 rounded-xl p-2 text-xs text-gray-700">
                      <div className="font-semibold text-gray-900">{m.user?.name}</div>
                      <div>{m.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder={isMember ? "Write a message..." : "Join to chat"}
                disabled={!isMember}
                className="flex-1 bg-[#f4f4f5] rounded-xl px-3 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={!isMember}
                className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-60"
              >
                Send
              </button>
            </form>
            {messageSubmitError && (
              <div className="text-xs text-red-600">{messageSubmitError}</div>
            )}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

const Page = () => (
  <RequireAuth>
    <CommunityPage />
  </RequireAuth>
);

export default Page;
