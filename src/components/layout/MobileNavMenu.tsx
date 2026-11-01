"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNavMenu({ closeMenu }: { closeMenu: () => void }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "MASJIDS", href: "/masjids" },
    { name: "ANNOUNCEMENTS", href: "/announcements" },
    { name: "EVENTS", href: "/events" },
    { name: "DONATIONS", href: "/donations" },
  ];

  return (
    <div className="flex flex-col gap-2 pt-4 text-left">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={closeMenu}
            className={`py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-between ${
              isActive
                ? "bg-[#194331] text-white"
                : "text-[#525E56] hover:bg-[#E6F0EB] hover:text-[#194331]"
            }`}
          >
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
