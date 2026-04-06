import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storedAuth = window.localStorage.getItem("devconnect-auth");
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        if (auth?.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${auth.token}`;
        }
      } catch {
        window.localStorage.removeItem("devconnect-auth");
      }
    }
  }
  return config;
});

export default api;
