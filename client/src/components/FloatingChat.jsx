"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { FiMessageSquare } from "react-icons/fi";
import Chat from "./Chat";
import api from "../services/api";

const FloatingChat = () => {
  const { conversations = [], unreadUsersCount, markConversationRead } = useAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [connections, setConnections] = useState([]);

  // when conversations change, if nothing selected choose first
  useEffect(() => {
    if (!open) return;
    if (!selected && conversations && conversations.length > 0) {
      setSelected(conversations[0].user);
    }
  }, [conversations, open, selected]);

  // if there are no conversations, load follow/following as connections when opened
  useEffect(() => {
    if (!open) return;
    if (conversations && conversations.length > 0) return;
    let mounted = true;
    const fetchConnections = async () => {
      try {
        const stored = window.localStorage.getItem('devconnect-auth');
        const authObj = stored ? JSON.parse(stored) : null;
        const userId = authObj?.user?.id || authObj?.user?._id || null;
        if (!userId) return;
        const res = await api.get(`/follow/${userId}/follow-data`);
        if (!mounted) return;
        const f = res.data || { followers: [], following: [] };
        const map = new Map();
        const add = (list) => (list || []).forEach(u => { if (u && u._id) map.set(String(u._id), u); });
        add(f.following);
        add(f.followers);
        setConnections(Array.from(map.values()));
      } catch (err) {
        console.error('fetchConnections error', err);
      }
    };
    fetchConnections();
    return () => { mounted = false; };
  }, [open, conversations]);

  const handleSelect = async (user) => {
    setSelected(user);
    // mark read for this conversation
    try {
      await markConversationRead(user._id);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((s) => !s)}
        aria-label="Open chat"
        className="fixed top-20 right-6 z-50 p-3 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center"
      >
        <FiMessageSquare size={20} />
        {unreadUsersCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full w-6 h-6">{unreadUsersCount}</span>
        )}
      </button>

      {open && (
        <div className="fixed top-20 right-6 z-40 w-80 max-w-[90vw] bg-white border rounded shadow-lg">
          <div className="px-3 py-2 border-b">
            <div className="flex gap-2 overflow-x-auto">
              {(conversations && conversations.length > 0) ? (
                conversations.map((c) => (
                  <button
                    key={String(c.user._id)}
                    onClick={() => handleSelect(c.user)}
                    className={`flex items-center gap-2 p-1 rounded ${selected && String(selected._id) === String(c.user._id) ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <img
                      src={c.user.avatar || '/default-avatar.svg'}
                      alt={c.user.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />
                    <div className="text-sm text-left">
                      <div className="font-semibold">{c.user.name}</div>
                      {c.unreadCount > 0 && (
                        <div className="text-xs text-red-500">{c.unreadCount}</div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                connections.map((u) => (
                  <button
                    key={String(u._id)}
                    onClick={() => handleSelect(u)}
                    className={`flex items-center gap-2 p-1 rounded hover:bg-gray-50`}
                  >
                    <img
                      src={u.avatar || '/default-avatar.svg'}
                      alt={u.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-avatar.svg";
                      }}
                    />
                    <div className="text-sm text-left">
                      <div className="font-semibold">{u.name}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-3">
            {selected ? (
              <Chat otherUserId={selected._id} />
            ) : (
              <div className="text-sm text-gray-600">Select a conversation to begin.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
