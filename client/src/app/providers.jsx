"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/authContext";

const Providers = ({ children }) => {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
};

export default Providers;
