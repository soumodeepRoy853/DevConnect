"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RequireAuth from "../../components/RequireAuth";
import api from "../../services/api";
import Chat from "../../components/Chat";
import { useAuth } from "../../context/authContext";
import { FiSearch, FiEdit } from "react-icons/fi";

const MessagesPage = () => {
  const searchParams = useSearchParams();
  const initialUid = searchParams ? searchParams.get("u") : null;

  const [selectedUser, setSelectedUser] = useState(null);
  const { conversations, auth, markConversationRead } = useAuth();
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState("conversations");
  const router = useRouter();

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
      setSelectedUser(null); // ensure message box closes when leaving
    };
  }, [initialUid]);

  // if no ?u param, auto-open the most recent conversation (if any)
  // Do not auto-open conversations. If `?u=` is present we'll open that user.
  // Otherwise show the follow/following lists and open chat only when a user is clicked.

  // when no selected conversation, load follow/following lists and dedupe
  useEffect(() => {
    if (initialUid) return; // if we're opening a specific user, skip loading lists
    if (selectedUser) return; // if a chat is open, don't overwrite UI
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

  return (
    <div className="min-h-screen">
      <div className="md:grid md:grid-cols-4 gap-6 min-h-[calc(100vh-2rem)] p-4">
        {/* Left nav - desktop only */}
        <aside className="hidden md:block md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-5">
            <div className="flex items-center gap-3 mb-4">
              <img src={auth?.user?.avatar || '/default-avatar.svg'} alt="me" className="w-12 h-12 rounded-full border" />
              <div>
                <div className="font-semibold">{auth?.user?.name}</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={async () => {
                  setActiveView("conversations");
                  // open the most recent conversation if any
                  if (conversations && conversations.length > 0) {
                    const c = conversations[0];
                    setSelectedUser({ _id: String(c.user._id), name: c.user?.name, avatar: c.user?.avatar });
                    try { await markConversationRead(c.user._id); } catch (e) {}
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Chats
              </button>
              <button
                onClick={() => setActiveView("contacts")}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Contacts
              </button>
            </nav>

            <div className="mt-4">
              <button onClick={() => { setActiveView('contacts'); setSelectedUser(null); }} className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700">New Message</button>
            </div>
          </div>
        </aside>

        {/* Conversations list */}
        <section className={`${selectedUser ? 'hidden md:block' : 'block'} md:col-span-1 bg-white rounded-lg shadow p-3`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <div className="text-lg font-semibold">Messages</div>
              <div className="text-sm text-gray-500">Conversations</div>
            </div>
            <button className="p-2 rounded hover:bg-gray-50"><FiEdit /></button>
          </div>

          <div className="mb-3">
            <div className="relative">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations..." className="w-full border rounded-full px-3 py-2 pr-10" />
              <div className="absolute right-2 top-2 text-gray-400"><FiSearch /></div>
            </div>
          </div>

          <div className="space-y-2 overflow-auto max-h-[60vh]">
            {activeView === "conversations" && (conversations || []).filter(c => {
              if (!query) return true;
              const q = query.toLowerCase();
              return (c.user?.name || "").toLowerCase().includes(q) || (c.lastMessage?.text || "").toLowerCase().includes(q);
            }).map((c) => (
              <button
                key={String(c.user._id)}
                onClick={async () => {
                  const uid = String(c.user._id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    // navigate to full-screen chat on mobile (same tab)
                    router.push(`/messages?u=${uid}`);
                    return;
                  }
                  setSelectedUser({ _id: uid, name: c.user?.name, avatar: c.user?.avatar });
                  try { await markConversationRead(c.user._id); } catch (e) {}
                }}
                className={`w-full text-left flex items-center gap-3 p-2 rounded ${selectedUser && String(selectedUser._id) === String(c.user._id) ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              >
                <img src={c.user?.avatar || '/default-avatar.svg'} alt={c.user?.name} className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{c.user?.name}</div>
                    <div className="text-xs text-gray-400">{c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</div>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage?.text || 'No messages yet'}</div>
                </div>
                {c.unreadCount > 0 && <div className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">{c.unreadCount}</div>}
              </button>
            ))}

            {activeView === "contacts" && (() => {
              const contacts = [...(following || []), ...(followers || [])];
              return contacts.filter(u => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
              }).map((u) => (
                <button
                  key={String(u._id)}
                    onClick={async () => {
                      const uid = String(u._id);
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        // navigate to full-screen chat on mobile (same tab)
                        router.push(`/messages?u=${uid}`);
                        return;
                      }
                      setSelectedUser({ _id: uid, name: u?.name, avatar: u?.avatar });
                      try { await markConversationRead(u._id); } catch (e) {}
                    }}
                    className={`w-full text-left flex items-center gap-3 p-2 rounded ${selectedUser && String(selectedUser._id) === String(u._id) ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <img src={u?.avatar || '/default-avatar.svg'} alt={u?.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{u?.name}</div>
                    <div className="text-xs text-gray-500">{u?.email}</div>
                  </div>
                </button>
              ));
            })()}
          </div>
        </section>

        {/* Chat pane */}
        <main className={`${selectedUser ? 'block' : 'hidden'} md:block md:col-span-2 bg-white rounded-lg shadow p-0 flex flex-col`}>
          {selectedUser ? (
            <div className="flex-1 flex flex-col">
              <Chat otherUserId={selectedUser._id} full onBack={() => setSelectedUser(null)} />
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">Select a conversation to start chatting.</div>
          )}
        </main>
      </div>
    </div>
  );
};

const Page = () => (
  <RequireAuth>
    <MessagesPage />
  </RequireAuth>
);

export default Page;
