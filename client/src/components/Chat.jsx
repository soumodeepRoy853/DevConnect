"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import { FiSend, FiPhone, FiMoreVertical, FiChevronLeft } from "react-icons/fi";

const Chat = ({ otherUserId, full = false, onBack = null }) => {
  const { auth, socket, onlineUsers, lastSeenMap } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    if (!otherUserId) {
      setMessages([]);
      setOtherUser(null);
      return;
    }

    let mounted = true;
    const fetchConv = async () => {
      try {
        const res = await api.get(`/message/${otherUserId}`);
        if (!mounted) return;
        setMessages(res.data || []);
      } catch (err) {
        console.error(err);
      }

      try {
        const prof = await api.get(`/profile/user/${otherUserId}`);
        if (!mounted) return;
        const p = prof.data?.profile;
        const name = p?.user?.name || p?.name || "User";
        const avatar = p?.avatar || p?.user?.avatar;
        const lastSeen = p?.user?.lastSeen || p?.lastSeen || null;
        setOtherUser({ _id: otherUserId, name, avatar, lastSeen });
      } catch (e) {
        // ignore
      }
    };

    if (auth?.token) fetchConv();

    return () => { mounted = false; };
  }, [otherUserId, auth?.token]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (!msg) return;
      try {
        const s = String(msg.sender);
        const r = String(msg.recipient);
        const me = String(auth.user?.id || "");
        const other = String(otherUserId || "");
        if ((s === me && r === other) || (s === other && r === me)) {
          setMessages((prev) => [...prev, msg]);
        }
      } catch (e) {
        // ignore
      }
    };
    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socket, otherUserId, auth.user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = (e) => {
    e && e.preventDefault();
    if (!text.trim() || !otherUserId) return;
    socket?.emit("private_message", { to: otherUserId, text });
    setText("");
  };

  const formatTime = (d) => {
    try {
      const date = new Date(d);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  const formatDateHeader = (d) => {
    try {
      const date = new Date(d);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return "";
    }
  };

  const formatLastSeen = (d) => {
    try {
      const date = new Date(d);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return `Last seen today at ${formatTime(date)}`;
      if (date.toDateString() === yesterday.toDateString()) return `Last seen yesterday at ${formatTime(date)}`;
      return `Last seen ${date.toLocaleDateString()} at ${formatTime(date)}`;
    } catch (e) {
      return "Offline";
    }
  };

  const sorted = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className={`flex flex-col h-full ${full ? "" : "h-[480px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 rounded hover:bg-gray-100">
              <FiChevronLeft />
            </button>
          )}
          <img src={otherUser?.avatar || "/default-avatar.svg"} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
              <div className="font-semibold">{otherUser?.name || "Conversation"}</div>
              {otherUserId && (onlineUsers && onlineUsers.has(String(otherUserId)) ? (
                <div className="text-xs text-green-600">Online</div>
              ) : (() => {
                const presenceLastSeen = (lastSeenMap && lastSeenMap[String(otherUserId)]) || otherUser?.lastSeen || null;
                return presenceLastSeen ? (
                  <div className="text-xs text-gray-500">{formatLastSeen(presenceLastSeen)}</div>
                ) : (
                  <div className="text-xs text-gray-500">Offline</div>
                );
              })())}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-gray-100"><FiPhone /></button>
          <button className="p-2 rounded hover:bg-gray-100"><FiMoreVertical /></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 bg-gray-50">
        {sorted.length === 0 && (
          <div className="text-center text-gray-500 mt-8">No messages yet. Say hello 👋</div>
        )}

        {(() => {
          let prevDateKey = null;
          return sorted.map((m) => {
            const msgDate = new Date(m.createdAt || Date.now());
            const dateKey = msgDate.toDateString();
            const parts = [];
            if (!prevDateKey || prevDateKey !== dateKey) {
              parts.push(
                <div key={`date-${dateKey}`} className="flex justify-center my-3">
                  <div className="text-xs px-3 py-1 rounded-full bg-white border text-gray-500">{formatDateHeader(msgDate)}</div>
                </div>
              );
              prevDateKey = dateKey;
            }

            const isMine = String(m.sender) === String(auth.user?.id);
            parts.push(
              <div key={m._id || `${m.createdAt}-${Math.random()}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}> 
                <div className={`inline-block max-w-[75%] px-4 py-2 rounded-2xl ${isMine ? 'bg-primary-600 text-white' : 'bg-white border border-gray-100 text-gray-800'}`}>
                  <div className="whitespace-pre-line">{m.text}</div>
                  <div className={`text-[11px] mt-2 ${isMine ? 'text-white/80' : 'text-gray-500'}`}>{formatTime(msgDate)}</div>
                </div>
              </div>
            );

            return parts;
          });
        })()}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-white">
        <form onSubmit={send} className="flex items-center gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
          />
          <button type="submit" aria-label="Send" className="p-3 rounded-full bg-primary-600 text-white hover:opacity-95">
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

