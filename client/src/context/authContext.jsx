"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_STORAGE_KEY = "devconnect-auth";
const AuthContext = createContext(null);

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [auth, setAuth] = useState({
    user: null,
    token: null,
  });

  const [isAuthReady, setIsAuthReady] = useState(false); 

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

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (auth.token) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const logout = () => {
    setAuth({ user: null, token: null });
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    router.push("/login");
  };

  const value = useMemo(
    () => ({ auth, setAuth, logout, isAuthReady }),
    [auth, isAuthReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
