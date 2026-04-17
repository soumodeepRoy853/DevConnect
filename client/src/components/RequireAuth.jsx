"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import { useSession } from "next-auth/react";

const RequireAuth = ({ children }) => {
  const { auth, isAuthReady } = useAuth();
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicAuthRoute = pathname === "/login" || pathname === "/register";
  const isLoggedIn = Boolean(auth?.token) || status === "authenticated";

  useEffect(() => {
    // Only redirect when NextAuth says unauthenticated and local auth is ready
    if (isPublicAuthRoute) return;
    if (!isAuthReady || status === "loading") return;
    if (status === "unauthenticated" && !auth?.token) {
      router.replace("/login");
    }
  }, [auth?.token, isAuthReady, status, router, isPublicAuthRoute]);

  if (isPublicAuthRoute) {
    return null;
  }

  if (status === "loading" || !isAuthReady) return null;
  if (!isLoggedIn) return null;

  return <>{children}</>;
};

export default RequireAuth;
