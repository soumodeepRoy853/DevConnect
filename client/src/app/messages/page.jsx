"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RequireAuth from "../../components/RequireAuth";
import MobileBottomNav from "../../components/MobileBottomNav";
import api from "../../services/api";

import { useAuth } from "../../context/authContext";
import { Search, Edit2, MessageSquare, Users, Settings, UserPlus } from "lucide-react";
import Chat from "../../components/Chat";

const MessagesPage = () => {
  const searchParams = useSearchParams();
  const initialUid = searchParams ? searchParams.get("u") : null;

  const [selectedUser, setSelectedUser] = useState(null);
  const { conversations, auth, markConversationRead, onlineUsers, lastSeenMap, fetchConversations } = useAuth();
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState("conversations"); // 'conversations' | 'contacts' | 'settings'
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const router = useRouter();
  const searchInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    if (!initialUid) return;

    const fetchUser = async () => {
      try {
        const res = await api.get(`/profile/user/${initialUid}`);
        const prof = res.data?.profile;
        if (!mounted) return;
        if (prof && prof.user) {
          setSelectedUser({ _id: String(prof.user._id || prof.user._id), name: prof.user.name, avatar: prof.avatar || prof.user.avatar });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
      setSelectedUser(null);
    };
  }, [initialUid]);

  useEffect(() => {
    if (initialUid || selectedUser) return;
    let mounted = true;
    const fetchConnections = async () => {
      try {
        const userId = auth?.user?.id || auth?.user?._id || null;
        if (!userId) return;
        const res = await api.get(`/follow/${userId}/follow-data`);
        if (!mounted) return;
        const f = res.data || { followers: [], following: [] };
        const followingList = (f.following || []).filter(u => u && u._id && String(u._id) !== String(userId));
        const followingIds = new Set(followingList.map(u => String(u._id)));
        const followersList = (f.followers || []).filter(u => u && u._id && String(u._id) !== String(userId) && !followingIds.has(String(u._id)));
        setFollowing(followingList);
        setFollowers(followersList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConnections();
    return () => { mounted = false; };
  }, [initialUid, selectedUser, auth?.user]);

  const getTimeLabel = (dStr) => {
    if (!dStr) return "";
    const d = new Date(dStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000 / 60);
    if (diff < 60) return diff === 0 ? "NOW" : `${diff}M AGO`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}H AGO`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "YESTERDAY";
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const getGroupedContacts = () => {
    const contacts = [...(following || []), ...(followers || [])];
    const filtered = contacts.filter(u => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (u.name || "").toLowerCase().includes(q);
    });
    
    // Sort alphabetically
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const grouped = {};
    filtered.forEach(c => {
      const firstLetter = (c.name || "#").charAt(0).toUpperCase();
      if (!grouped[firstLetter]) grouped[firstLetter] = [];
      grouped[firstLetter].push(c);
    });
    return grouped;
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} conversation(s)?`)) return;
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/message/conversation/${id}`)));
      await fetchConversations();
      clearSelection();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete conversations.");
    }
  };

  return (
    <div className={`min-h-screen bg-[#fafafa] flex flex-col ${selectedUser ? 'md:bg-transparent' : ''}`}>
      <div className={`flex-1 w-full max-w-[1200px] mx-auto ${selectedUser ? 'md:grid md:grid-cols-3' : 'md:grid md:grid-cols-1 lg:grid-cols-[1fr_2fr] lg:gap-8'} md:p-6 lg:p-8`}>
        
        {/* Left/Main List View */}
        <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col w-full h-full max-w-full md:max-w-md lg:max-w-[480px] bg-[#fafafa] md:bg-white md:rounded-[32px] md:shadow-sm md:border md:border-gray-100 overflow-hidden relative pb-[80px] md:pb-0 mx-auto`}>
          
          {/* Header */}
          <div className="px-5 pt-5 pb-3 bg-[#fafafa] md:bg-white z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h1 className="text-[22px] font-bold text-gray-900">
                  {activeView === 'conversations' ? 'Messages' : 'Contacts'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {activeView === "conversations" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectMode) return clearSelection();
                      setSelectMode(true);
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-primary-600"
                  >
                    {selectMode ? "Cancel" : "Select"}
                  </button>
                )}
                <button
                  className="text-[#3e53d7] hover:bg-blue-50 p-2 rounded-full transition-colors"
                  onClick={() => searchInputRef.current?.focus()}
                  aria-label="Focus search"
                >
                  <Search className="w-[22px] h-[22px]" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-[18px] h-[18px] text-gray-500" />
              </div>
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={`Search ${activeView}...`} 
                ref={searchInputRef}
                className="w-full bg-[#f4f4f5] rounded-2xl py-3.5 pl-11 pr-4 text-[15px] outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4 no-scrollbar">
            
            {/* Conversations */}
            {activeView === "conversations" && (
              <div className="space-y-3 pt-2">
                {(conversations || []).filter(c => {
                  if (!query) return true;
                  const q = query.toLowerCase();
                  return (c.user?.name || "").toLowerCase().includes(q) || (c.lastMessage?.text || "").toLowerCase().includes(q);
                }).filter((c) => String(c.user?._id) !== String(auth?.user?.id)).map((c) => (
                  <button
                    key={String(c.user._id)}
                    onClick={async () => {
                      const uid = String(c.user._id);
                      if (selectMode) {
                        toggleSelect(uid);
                        return;
                      }
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        router.push(`/messages?u=${uid}`);
                        return;
                      }
                      setSelectedUser({ _id: uid, name: c.user?.name, avatar: c.user?.avatar });
                      try { await markConversationRead(c.user._id); } catch(e) {}
                    }}
                    className={`w-full text-left bg-white rounded-[24px] p-4 flex items-center gap-4 transition-all shadow-[0_2px_15px_rgba(0,0,0,0.03)] border ${selectedUser && String(selectedUser._id) === String(c.user._id) ? 'border-primary-300 ring-1 ring-primary-100' : 'border-gray-50 hover:border-gray-200'}`}
                  >
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(String(c.user._id))}
                        onChange={() => toggleSelect(String(c.user._id))}
                        className="w-4 h-4 accent-primary-600"
                      />
                    )}
                    <div className="relative shrink-0">
                      <img
                        src={c.user?.avatar || '/default-avatar.svg'}
                        alt={c.user?.name}
                        className="w-[52px] h-[52px] rounded-[16px] object-cover bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-avatar.svg";
                        }}
                      />
                      {c.unreadCount > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#3e53d7] border-[3px] border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex justify-between items-end mb-1">
                        <div className="font-semibold text-gray-900 text-[16px] truncate pr-2">{c.user?.name}</div>
                        <div className="text-[10px] font-bold text-[#64748b] tracking-wide whitespace-nowrap shrink-0 uppercase">
                          {getTimeLabel(c.lastMessage?.createdAt)}
                        </div>
                      </div>
                      <div className={`text-[14px] truncate ${c.unreadCount > 0 ? 'font-semibold text-gray-900 italic' : 'text-gray-500'}`}>
                        {c.lastMessage?.text || 'No messages yet'}
                      </div>
                    </div>
                    {c.unreadCount > 0 && <div className="absolute right-5 bottom-4 w-2 h-2 bg-[#3e53d7] rounded-full"></div>}
                  </button>
                ))}
              </div>
            )}

            {/* Contacts */}
            {activeView === "contacts" && (() => {
              const grouped = getGroupedContacts();
              return Object.keys(grouped).sort().map(letter => (
                <div key={letter} className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#aeb6e8] font-black text-[22px] px-1">{letter}</span>
                    <div className="h-px bg-gray-200 flex-1 ml-4 mr-2"></div>
                  </div>
                  <div className="space-y-4">
                    {grouped[letter].filter((u) => String(u._id) !== String(auth?.user?.id)).map(u => {
                      const isOnline = onlineUsers?.has(String(u._id));
                      const offlineLabel = u?.lastSeen ? `Offline • ${getTimeLabel(u.lastSeen)}` : "Offline";
                      return (
                        <button
                          key={String(u._id)}
                          onClick={async () => {
                            const uid = String(u._id);
                            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                              router.push(`/messages?u=${uid}`);
                              return;
                            }
                            setSelectedUser({ _id: uid, name: u?.name, avatar: u?.avatar });
                            try { await markConversationRead(u._id); } catch(e) {}
                          }}
                          className={`w-full flex items-center gap-4 group p-2 -mx-2 rounded-xl transition-colors ${selectedUser && String(selectedUser._id) === String(u._id) ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={u?.avatar || '/default-avatar.svg'}
                              alt={u?.name}
                              className="w-[52px] h-[52px] rounded-[16px] object-cover bg-gray-100 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/default-avatar.svg";
                              }}
                            />
                            <div className={`absolute -bottom-1 -right-1 w-[14px] h-[14px] border-[2px] border-[#fafafa] md:border-white rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-gray-300'}`}></div>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-gray-900 text-[16px]">{u?.name}</div>
                            <div className="text-[13px] text-gray-500 mt-0.5">
                              {isOnline ? 'Online' : offlineLabel}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}

            {activeView === "settings" && (
              <div className="pt-6 px-2">
                <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2">Quick Settings</h3>
                  <p className="text-[13px] text-gray-500 mb-4">
                    Update your password, privacy, and notification preferences.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/settings")}
                    className="w-full bg-[#3e53d7] text-white py-2.5 rounded-[12px] font-semibold hover:bg-[#3144c2] transition-colors"
                  >
                    Open Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectMode && activeView === "conversations" && (
            <div className="absolute bottom-[78px] left-0 right-0 px-5">
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className="w-full bg-red-50 text-red-600 py-2.5 rounded-[12px] font-semibold border border-red-100 disabled:opacity-60"
              >
                Delete Selected ({selectedIds.length})
              </button>
            </div>
          )}

          {/* Floating Action Button */}
          <div className="absolute bottom-24 right-5 md:bottom-20 md:right-5">
            <button
              className="w-[52px] h-[52px] bg-[#3e53d7] text-white rounded-[16px] flex items-center justify-center shadow-[0_8px_20px_rgba(62,83,215,0.35)] hover:bg-[#3144c2] hover:-translate-y-1 transition-all"
              onClick={() => {
                setActiveView("contacts");
                searchInputRef.current?.focus();
              }}
              aria-label="Start a new message"
            >
              {activeView === 'conversations' ? <Edit2 className="w-6 h-6" strokeWidth={2.5}/> : <UserPlus className="w-[22px] h-[22px]" strokeWidth={2.5}/>}
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-2 pb-5 md:pb-3 flex justify-evenly items-center shadow-[0_-8px_24px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => setActiveView('conversations')}
              className={`flex flex-col items-center gap-1 w-16 p-2 rounded-xl transition-colors ${activeView === 'conversations' ? 'text-[#3e53d7] bg-blue-50/50' : 'text-[#8692a6] hover:bg-gray-50'}`}
            >
              <MessageSquare className="w-[22px] h-[22px] fill-current" strokeWidth={2} />
              <span className="text-[11px] font-semibold">Chats</span>
            </button>
            <button
              onClick={() => setActiveView('contacts')}
              className={`flex flex-col items-center gap-1 w-16 p-2 rounded-xl transition-colors ${activeView === 'contacts' ? 'text-[#3e53d7] bg-blue-50/50' : 'text-[#8692a6] hover:bg-gray-50'}`}
            >
              <Users className="w-[22px] h-[22px] fill-current" strokeWidth={2} />
              <span className="text-[11px] font-semibold">Contacts</span>
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className={`flex flex-col items-center gap-1 w-16 p-2 rounded-xl transition-colors ${activeView === 'settings' ? 'text-[#3e53d7] bg-blue-50/50' : 'text-[#8692a6] hover:bg-gray-50'}`}
            >
              <Settings className="w-[22px] h-[22px] fill-current" strokeWidth={2} />
              <span className="text-[11px] font-semibold">Settings</span>
            </button>
          </div>
        </div>

        {/* Chat Pane (Desktop) */}
        <div className={`${selectedUser ? 'flex' : 'hidden'} md:flex md:col-span-2 flex-col w-full h-[100dvh] md:h-full bg-white md:rounded-[32px] md:shadow-[0_2px_25px_rgba(0,0,0,0.04)] md:border md:border-gray-100 overflow-hidden`}>
          {selectedUser ? (
            <Chat otherUserId={selectedUser._id} full onBack={() => {
              if(window.innerWidth < 768) router.push('/messages');
              setSelectedUser(null);
            }} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-200" strokeWidth={1} />
              <p className="text-lg font-medium text-gray-500">Select a conversation</p>
              <p className="text-sm mt-2">Choose someone from the list to start chatting.</p>
            </div>
          )}
        </div>

      </div>
      <MobileBottomNav />
    </div>
  );
};

const Page = () => (
  <RequireAuth>
    <MessagesPage />
  </RequireAuth>
);

export default Page;
