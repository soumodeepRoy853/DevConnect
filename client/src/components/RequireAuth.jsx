"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import Loader from "./Loader";

const RequireAuth = ({ children }) => {
  const { auth, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !auth?.token) {
      router.replace("/login");
    }
  }, [auth?.token, isAuthReady, router]);

  if (!isAuthReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader label="Loading" />
      </div>
    );
  }

  if (!auth?.token) {
    return null;
  }

  return <>{children}</>;
};

export default RequireAuth;
