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
  if (status === "authenticated" && !auth?.token) return null;
  if (!auth?.token) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
