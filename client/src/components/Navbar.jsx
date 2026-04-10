"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/authContext";
import { Search, Menu, X } from "lucide-react";

const Navbar = () => {
  const { auth, logout, unreadUsersCount } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // lock body scroll when mobile menu is open
    try {
      if (typeof window !== 'undefined') {
        if (open) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    } catch (e) {}

    return () => { try { document.body.style.overflow = ''; } catch (e) {} };
  }, [open]);

  return (
    <>
      <nav
        className="relative z-50 text-white py-3 px-6 shadow-md flex items-center justify-between"
        style={{ backgroundColor: 'var(--primary-600)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
      >
        <Link href="/" className="text-2xl font-bold tracking-wide">
          DevConnect
        </Link>

        {/* Hamburger for mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="md:hidden p-2 rounded hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-4 items-center">
            <Link href="/search" title="Search">
              <Search className="w-5 h-5 hover:text-primary-200 transition duration-200" />
            </Link>

            <Link href="/messages" className="hover:underline flex items-center gap-2">Messages {unreadUsersCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadUsersCount}</span>}</Link>

            {auth.user ? (
              <>
                <Link href="/feed" className="hover:underline">Home</Link>
                <Link href="/profile" className="hover:underline">My Profile</Link>
                <Link href="/explore" className="hover:underline">Discover</Link>
                <Link href="/edit-profile" className="hover:underline">Edit</Link>
                <button
                  onClick={logout}
                  className="hover:underline text-red-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:underline">Login</Link>
                <Link href="/register" className="hover:underline">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu (fixed overlay) */}
      <div
        className={`${open ? "block" : "hidden"} md:hidden fixed inset-0 z-40 px-6 pb-4 pt-16 overflow-auto`}
        style={{ backgroundColor: 'var(--primary-600)' }}
      >
        <div className="flex flex-col gap-3">
          <Link href="/search" title="Search" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <Search className="w-5 h-5" /> <span>Search</span>
          </Link>

          {auth.user ? (
            <>
              <Link href="/feed" className="hover:underline" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/messages" className="hover:underline flex items-center gap-2" onClick={() => setOpen(false)}>Messages {unreadUsersCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadUsersCount}</span>}</Link>
              <Link href="/profile" className="hover:underline" onClick={() => setOpen(false)}>My Profile</Link>
              <Link href="/explore" className="hover:underline" onClick={() => setOpen(false)}>Discover</Link>
              <Link href="/edit-profile" className="hover:underline" onClick={() => setOpen(false)}>Edit</Link>
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="hover:underline text-red-200 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="hover:underline" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
