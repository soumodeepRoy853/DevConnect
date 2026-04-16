"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/authContext";
import { ArrowLeft, Video, Search, PlusCircle, Image as ImageIcon, Smile, Send } from "lucide-react";

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
      if (date.toDateString() === today.toDateString()) return "TODAY";
      if (date.toDateString() === yesterday.toDateString()) return "YESTERDAY";
      return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }).toUpperCase();
    } catch (e) {
      return "";
    }
  };

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages]
  );
  const isOnline = otherUserId && onlineUsers && onlineUsers.has(String(otherUserId));

  const displayMessages = sorted;

  return (
    <div className={`flex flex-col h-full bg-[#f8f9fc] ${full ? "w-full" : "h-[480px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white md:rounded-t-[32px] z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-1 md:hidden text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft strokeWidth={2.5} className="w-6 h-6" />
            </button>
          )}
          <div className="relative shrink-0">
            <img
              src={otherUser?.avatar || "/default-avatar.svg"}
              alt="avatar"
              className="w-[44px] h-[44px] rounded-[14px] object-cover bg-gray-100"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/default-avatar.svg";
              }}
            />
            {isOnline && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-[2.5px] border-white rounded-full"></div>}
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-bold text-[17px] text-gray-900 leading-tight">{otherUser?.name || "Conversation"}</div>
            {isOnline ? (
              <div className="text-[10px] font-bold text-[#3e53d7] tracking-wide uppercase mt-0.5">Online Now</div>
            ) : (
              <div className="text-[10px] font-bold text-gray-400 tracking-wide uppercase mt-0.5">Offline</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 mr-1 text-[#3e53d7]">
          <button className="hover:text-[#3144c2] transition-colors"><Video strokeWidth={2.5} className="w-6 h-6 fill-current" /></button>
          <button className="hover:text-[#3144c2] transition-colors"><Search strokeWidth={2.5} className="w-[22px] h-[22px]" /></button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar bg-[#f8f9fc]">
        {displayMessages.length === 0 && (
          <div className="text-center text-gray-500 mt-8 text-[14px]">No messages yet. Say hello 👋</div>
        )}

        {(() => {
          let prevDateKey = null;
          return displayMessages.map((m) => {
            const msgDate = new Date(m.createdAt || Date.now());
            const dateKey = msgDate.toDateString();
            const parts = [];
            
            if (!prevDateKey || prevDateKey !== dateKey) {
              parts.push(
                <div key={`date-${dateKey}`} className="flex justify-center my-6">
                  <div className="text-[11px] font-bold px-4 py-1.5 rounded-full bg-[#f1f2f6] text-[#8692a6] tracking-wider">
                    {formatDateHeader(msgDate)}
                  </div>
                </div>
              );
              prevDateKey = dateKey;
            }

            const isMine = String(m.sender) === String(auth.user?.id) || m.sender === 'me';
            const deliveredAt = m.deliveredAt ? new Date(m.deliveredAt) : null;
            const readAt = m.readAt ? new Date(m.readAt) : (m.read ? new Date(m.updatedAt || m.createdAt) : null);
            const statusLabel = (() => {
              if (!isMine) return formatTime(msgDate);
              if (readAt) return `Seen ${formatTime(readAt)}`;
              if (deliveredAt || isOnline) return `Delivered ${formatTime(msgDate)}`;
              return `Sent ${formatTime(msgDate)}`;
            })();
            
            // Check for code snippet (using markdown like block)
            const textContent = m.text || "";
            const isCode = textContent.includes('```');

            let parsedCode = "";
            let codeTitle = "SNIPPET";
            let normalText = textContent;

            if (isCode) {
              const split = textContent.split('```');
              if (split.length >= 3) {
                // e.g. split[1] has "javascript\nCONFIG.REDIS.JS\nconst..."
                let codeContent = split[1].replace(/^(javascript|js|python|py)\n?/i, '');
                const firstLineBreak = codeContent.indexOf('\n');
                if (firstLineBreak > 0) {
                  const possibleTitle = codeContent.substring(0, firstLineBreak).trim();
                  if (possibleTitle && !possibleTitle.includes(' ') && possibleTitle === possibleTitle.toUpperCase()) {
                    codeTitle = possibleTitle;
                    codeContent = codeContent.substring(firstLineBreak + 1);
                  }
                }
                parsedCode = codeContent;
                normalText = ""; // Assuming only code for snippet
              }
            }

            if (isCode && parsedCode) {
              // Render Snippet
              parts.push(
                <div key={m._id} className={`flex justify-start mb-6`}>
                  <div className="max-w-[85%] md:max-w-[70%]">
                    <div className="bg-[#111111] rounded-xl overflow-hidden shadow-lg border border-gray-800">
                      <div className="flex items-center px-4 py-3 border-b border-white/10">
                        <div className="flex gap-1.5 shrink-0">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#e8e9ec]"></div>
                        </div>
                        <div className="flex-1 text-center text-[10px] font-mono tracking-widest text-[#8692a6] mr-8">
                          {codeTitle}
                        </div>
                      </div>
                      <div className="p-4 overflow-x-auto">
                        <pre className="text-[13px] font-mono text-gray-300 leading-relaxed">
                          <code>{parsedCode}</code>
                        </pre>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-[#8692a6] tracking-wide uppercase mt-3">
                      SNIPPET SENT BY {(isMine ? "YOU" : (otherUser?.name?.split(' ')[0] || "USER"))}
                    </div>
                  </div>
                </div>
              );
            } else {
              // Render normal message
              parts.push(
                <div key={m._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-6`}> 
                  <div className={`px-5 py-3.5 rounded-[20px] max-w-[85%] md:max-w-[70%] shadow-sm ${
                    isMine 
                      ? 'bg-[#3e53d7] text-white rounded-br-[8px]' 
                      : 'bg-white border border-gray-50 text-[#3b415a] rounded-bl-[8px]'
                  }`}>
                    <div className="whitespace-pre-line text-[15px] leading-relaxed">{normalText}</div>
                  </div>
                  <div className="text-[11px] font-medium mt-2 mx-1 text-[#8692a6]">
                    {statusLabel}
                  </div>
                </div>
              );
            }

            return parts;
          });
        })()}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-gray-100 bg-[#f8f9fc] md:rounded-b-[32px] shrink-0">
        <form onSubmit={send} className="flex items-center gap-3">
          <button type="button" className="p-2.5 text-[#8692a6] hover:bg-gray-200 rounded-full transition-colors shrink-0">
            <PlusCircle className="w-6 h-6" strokeWidth={2.5}/>
          </button>
          <button type="button" className="p-2.5 text-[#8692a6] hover:bg-gray-200 rounded-full transition-colors shrink-0 hidden sm:block">
            <ImageIcon className="w-[22px] h-[22px]" strokeWidth={2.5}/>
          </button>
          
          <div className="flex-1 relative flex items-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message..."
              className="w-full bg-[#f1f2f6] rounded-2xl py-3.5 pl-4 pr-12 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none"
            />
            <button type="button" className="absolute right-3.5 text-[#3e53d7] hover:text-[#3144c2] transition-colors p-1">
              <Smile className="w-[22px] h-[22px]" strokeWidth={2.5} />
            </button>
          </div>
          
          <button 
            type="submit" 
            aria-label="Send" 
            className="p-3.5 rounded-2xl bg-[#3e53d7] text-white hover:bg-[#3144c2] shadow-[0_4px_12px_rgba(62,83,215,0.25)] transition-all shrink-0 ml-1"
          >
            <Send className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

