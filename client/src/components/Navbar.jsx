"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/authContext";
import { Search } from "lucide-react";

const Navbar = () => {
  const { auth, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white py-3 px-6 shadow-md flex flex-wrap justify-between items-center">
      <Link href="/" className="text-2xl font-bold tracking-wide">
        DevConnect
      </Link>

      <div className="flex gap-4 items-center mt-2 md:mt-0">
        {/* Search Icon */}
        <Link href="/search" title="Search">
          <Search className="w-5 h-5 hover:text-blue-200 transition duration-200" />
        </Link>

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
    </nav>
  );
};

export default Navbar;
