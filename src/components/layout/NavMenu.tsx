"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavMenu() {
  const pathname = usePathname();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "MASJIDS", href: "/masjids" },
    { name: "ANNOUNCEMENTS", href: "/announcements" },
    { name: "EVENTS", href: "/events" },
    { name: "DONATIONS", href: "/donations" },
  ];

  return (
    <nav className="hidden lg:flex items-center gap-8 text-[14px] font-bold tracking-wider text-[#181E1A]">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`transition duration-150 py-2 border-b-2 ${
              isActive
                ? "text-[#194331] border-[#BF8B36] font-extrabold"
                : "border-transparent text-[#525E56] hover:text-[#194331] hover:border-[#194331]/30"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
