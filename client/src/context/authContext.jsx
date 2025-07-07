import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Create context
const AuthContext = createContext();

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [auth, setAuth] = useState({
    user: null,
    token: null,
  });

  const [isAuthReady, setIsAuthReady] = useState(false); // ✅ Track loading

  // Load from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("devconnect-auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
    setIsAuthReady(true); // ✅ Done loading
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("devconnect-auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("devconnect-auth");
    }
  }, [auth]);

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem("devconnect-auth");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};
