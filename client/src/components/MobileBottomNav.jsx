"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Users, User, Users2 } from "lucide-react";

const items = [
  { href: "/feed", label: "Feed", Icon: Home },
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/community", label: "Community", Icon: Users2 },
  { href: "/messages", label: "Connect", Icon: Users },
  { href: "/profile", label: "Profile", Icon: User },
];

const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-white/70 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto flex max-w-xl items-center justify-around px-4 py-3">
        {items.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (pathname === "/" && href === "/feed") || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 text-xs ${isActive ? "text-primary-600" : "text-gray-400"}`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
