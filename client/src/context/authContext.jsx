"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { io } from "socket.io-client";
import api from "../services/api";
import { useRouter } from "next/navigation";

const AUTH_STORAGE_KEY = "devconnect-auth";
const AuthContext = createContext(null);

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [auth, setAuth] = useState(() => {
    if (typeof window === "undefined") {
      return { user: null, token: null };
    }
    const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    return { user: null, token: null };
  });

  const [isAuthReady, setIsAuthReady] = useState(() => typeof window !== "undefined");
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});

  // Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsAuthReady(true);
  }, []);

  // Sync with NextAuth session (OAuth providers)
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.token) {
      const sUser = session.user || {};
      const mapped = {
        id: sUser.id || sUser._id || sUser.id,
        name: sUser.name,
        email: sUser.email,
        avatar: sUser.avatar || sUser.image || null,
      };
      setAuth({ user: mapped, token: session.token });
    }
    if (status === "unauthenticated") {
      setAuth({ user: null, token: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (auth.token) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  // Create or teardown socket when auth token changes
  useEffect(() => {
    if (!isAuthReady) return;
    const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const socketUrl = raw.replace(/\/api$/, "");

    if (auth?.token) {
      const s = io(socketUrl, {
        auth: { token: auth.token },
        transports: ["websocket"],
      });
      setSocket(s);
      s.on('connect_error', (err) => console.error('Socket connect error', err));
      return () => {
        s.disconnect();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, isAuthReady]);

  // fetch conversations (users with last message + unread counts)
  const fetchConversations = async () => {
    try {
      const res = await api.get('/message/conversations');
      setConversations(res.data || []);
    } catch (err) {
      console.error('fetchConversations error', err);
    }
  };

  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  const refreshUser = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const res = await api.get('/user/all-users');
      const user = res.data?.user;
      if (!user) return;

      let resolvedAvatar = user.avatar;
      if (!resolvedAvatar || resolvedAvatar === DEFAULT_AVATAR) {
        try {
          const profileRes = await api.get('/profile/my');
          const profileAvatar = profileRes.data?.profile?.avatar;
          if (profileAvatar) resolvedAvatar = profileAvatar;
        } catch (err) {
          // no profile yet
        }
      }

      setAuth((prev) => {
        const mapped = {
          id: user._id || user.id || prev?.user?.id,
          name: user.name,
          email: user.email,
          avatar: resolvedAvatar || user.avatar,
        };
        return { ...prev, user: { ...prev.user, ...mapped } };
      });
    } catch (err) {
      console.error('refreshUser error', err);
    }
  }, [auth?.token]);

  // Fetch conversations once when auth is ready / user is present
  useEffect(() => {
    if (!isAuthReady) return;
    if (auth?.user) fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, auth?.user]);

  // Refresh user details after auth is ready to keep avatar/profile current
  useEffect(() => {
    if (!isAuthReady || !auth?.token) return;
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, auth?.token, refreshUser]);

  // listen to new_message and update conversations
  useEffect(() => {
    if (!socket || !auth?.user) return;

    // initial load
    fetchConversations();

    const handler = (msg) => {
      if (!msg) return;
      const myId = String(auth.user.id);
      const sender = String(msg.sender);
      const recipient = String(msg.recipient);

      // if I'm the recipient, increment unread for that sender
      if (recipient === myId) {
        setConversations((prev) => {
          // try update locally
          const idx = prev.findIndex((c) => String(c.user._id) === sender);
          if (idx !== -1) {
            const updated = [...prev];
            const conv = { ...updated[idx] };
            conv.unreadCount = (conv.unreadCount || 0) + 1;
            conv.lastMessage = { text: msg.text, sender: msg.sender, recipient: msg.recipient, createdAt: msg.createdAt };
            // move to top
            updated.splice(idx, 1);
            updated.unshift(conv);
            return updated;
          }
          // unknown conversation, refresh full list
          fetchConversations();
          return prev;
        });
      } else {
        // if I'm sender, update lastMessage and move conversation to top
        setConversations((prev) => {
          const other = recipient === myId ? sender : recipient;
          const idx = prev.findIndex((c) => String(c.user._id) === (other));
          if (idx !== -1) {
            const updated = [...prev];
            const conv = { ...updated[idx] };
            conv.lastMessage = { text: msg.text, sender: msg.sender, recipient: msg.recipient, createdAt: msg.createdAt };
            updated.splice(idx, 1);
            updated.unshift(conv);
            return updated;
          }
          return prev;
        });
      }
    };

    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, auth?.user]);

  // listen for presence events and maintain online users + last-seen map
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (arr) => {
      try {
        const ids = (arr || []).map(String);
        setOnlineUsers(new Set(ids));
        setLastSeenMap((prev) => {
          const next = { ...prev };
          for (const id of ids) {
            if (id in next) delete next[id];
          }
          return next;
        });
      } catch (e) {
        setOnlineUsers(new Set());
        setLastSeenMap({});
      }
    };

    const handleUserOnline = (payload) => {
      const id = payload && payload.id ? String(payload.id) : String(payload);
      setOnlineUsers((prev) => {
        const s = new Set(prev);
        s.add(id);
        return s;
      });
      setLastSeenMap((prev) => {
        const next = { ...prev };
        if (id in next) delete next[id];
        return next;
      });
    };

    const handleUserOffline = (payload) => {
      const id = payload && payload.id ? String(payload.id) : String(payload);
      const lastSeen = payload && payload.lastSeen ? payload.lastSeen : new Date().toISOString();
      setOnlineUsers((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      setLastSeenMap((prev) => {
        const next = { ...prev };
        next[id] = lastSeen;
        return next;
      });
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      setOnlineUsers(new Set());
      setLastSeenMap({});
    };
  }, [socket]);

  // mark conversation read by fetching conversation endpoint which marks messages read server-side
  const markConversationRead = async (otherUserId) => {
    try {
      await api.get(`/message/${otherUserId}`);
      await fetchConversations();
    } catch (err) {
      console.error('markConversationRead error', err);
    }
  };

  const logout = async () => {
    setAuth({ user: null, token: null });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    await signOut({ redirect: false });
    router.push("/login");
  };

  const unreadUsersCount = useMemo(() => (conversations || []).filter(c => c.unreadCount > 0).length, [conversations]);

  const value = useMemo(
    () => ({ auth, setAuth, logout, isAuthReady, socket, conversations, unreadUsersCount, markConversationRead, fetchConversations, refreshUser, onlineUsers, lastSeenMap }),
    [auth, isAuthReady, socket, conversations, unreadUsersCount, refreshUser, onlineUsers, lastSeenMap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
