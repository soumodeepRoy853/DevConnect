"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/authContext";
import { Search, Settings, Home, Compass, MessageSquare, LogIn, UserPlus, Users2 } from "lucide-react";

const Navbar = () => {
  const { auth, unreadUsersCount } = useAuth();
  const pathname = usePathname();
  const isActive = (href) => {
    if (href === "/feed") {
      return pathname === "/" || pathname === "/feed" || pathname.startsWith("/feed/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const linkClass = (href) =>
    `flex flex-col items-center gap-1 ${isActive(href) ? "text-primary-600" : "text-gray-500 hover:text-primary-600"}`;
  const labelClass = (href) =>
    `text-[10px] font-semibold ${isActive(href) ? "border-b-2 border-primary-600" : ""}`;

  return (
    <>
      <nav className="relative z-50 bg-white/95 backdrop-blur-md border-b border-white/70 px-4 sm:px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {auth.user && (
              <img
                src={auth.user?.avatar || "/default-avatar.svg"}
                alt="profile"
                className="w-9 h-9 rounded-full object-cover border border-white/70"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.svg";
                }}
              />
            )}
            <Link href="/" className="text-xl sm:text-2xl font-semibold tracking-tight text-primary-600">
              DevConnect
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-4 items-center text-gray-500">
              <Link href="/search" title="Search" aria-label="Search" className={linkClass("/search")}>
                <Search className="w-5 h-5" />
                <span className={labelClass("/search")}>Search</span>
              </Link>

              {auth.user ? (
                <>
                  <Link href="/feed" title="Home" aria-label="Home" className={linkClass("/feed")}>
                    <Home className="w-5 h-5" />
                    <span className={labelClass("/feed")}>Home</span>
                  </Link>
                  <Link href="/explore" title="Discover" aria-label="Discover" className={linkClass("/explore")}>
                    <Compass className="w-5 h-5" />
                    <span className={labelClass("/explore")}>Discover</span>
                  </Link>
                  <Link href="/community" title="Community" aria-label="Community" className={linkClass("/community")}>
                    <Users2 className="w-5 h-5" />
                    <span className={labelClass("/community")}>Community</span>
                  </Link>
                  <Link href="/messages" title="Messages" aria-label="Messages" className={`relative ${linkClass("/messages")}`}>
                    <MessageSquare className="w-5 h-5" />
                    {unreadUsersCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                        {unreadUsersCount}
                      </span>
                    )}
                    <span className={labelClass("/messages")}>Messages</span>
                  </Link>
                  <Link href="/settings" title="Settings" aria-label="Settings" className={linkClass("/settings")}>
                    <Settings className="w-5 h-5" />
                    <span className={labelClass("/settings")}>Settings</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" title="Login" aria-label="Login" className="hover:text-primary-600 flex flex-col items-center gap-1">
                    <LogIn className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Login</span>
                  </Link>
                  <Link href="/register" title="Register" aria-label="Register" className="hover:text-primary-600 flex flex-col items-center gap-1">
                    <UserPlus className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
