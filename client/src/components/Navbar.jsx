"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/authContext";
import { Search, Settings, Home, Compass, MessageSquare, User, LogOut, LogIn, UserPlus, Users2 } from "lucide-react";

const Navbar = () => {
  const { auth, logout, unreadUsersCount } = useAuth();

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
            <Link href="/settings" className="text-gray-500 hover:text-primary-600" title="Settings">
              <Settings className="w-5 h-5" />
            </Link>

            <div className="hidden md:flex gap-4 items-center text-gray-500">
              <Link href="/search" title="Search" aria-label="Search" className="hover:text-primary-600 flex flex-col items-center gap-1">
                <Search className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Search</span>
              </Link>

              {auth.user ? (
                <>
                  <Link href="/feed" title="Home" aria-label="Home" className="hover:text-primary-600 flex flex-col items-center gap-1">
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Home</span>
                  </Link>
                  <Link href="/explore" title="Discover" aria-label="Discover" className="hover:text-primary-600 flex flex-col items-center gap-1">
                    <Compass className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Discover</span>
                  </Link>
                  <Link href="/community" title="Community" aria-label="Community" className="hover:text-primary-600 flex flex-col items-center gap-1">
                    <Users2 className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Community</span>
                  </Link>
                  <Link href="/messages" title="Messages" aria-label="Messages" className="relative hover:text-primary-600 flex flex-col items-center gap-1">
                    <MessageSquare className="w-5 h-5" />
                    {unreadUsersCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                        {unreadUsersCount}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold">Messages</span>
                  </Link>
                  <Link href="/profile" title="Profile" aria-label="Profile" className="hover:text-primary-600 flex flex-col items-center gap-1">
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Profile</span>
                  </Link>
                  <button onClick={logout} title="Logout" aria-label="Logout" className="hover:text-red-600 text-red-500 flex flex-col items-center gap-1">
                    <LogOut className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Logout</span>
                  </button>
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
