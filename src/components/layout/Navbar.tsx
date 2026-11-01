"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard, Heart, Bell, ShieldCheck } from "lucide-react";
import { Logo } from "../ui/Logo";
import NavMenu from "./NavMenu";
import MobileNavMenu from "./MobileNavMenu";

interface UserSession {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mMenuOpen, setMMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        setProfileDropdownOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === "SUPER_ADMIN") return "/super-admin";
    if (user.role === "MASJID_ADMIN") return "/masjid-admin/masjid-details";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-md border-b border-[#E5DFD3]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Logo />

          {/* Desktop Nav links */}
          <NavMenu />

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
            ) : user ? (
              // Authenticated User Menu
              <div className="relative">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    type="button"
                    className="flex items-center gap-2.5 cursor-pointer focus:outline-none bg-white p-1.5 pl-3 rounded-full border border-[#E5DFD3] shadow-2xs hover:border-[#BF8B36] transition"
                  >
                    <span className="text-xs font-bold text-[#194331] max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
                    <span className="w-8 h-8 rounded-full bg-[#194331] text-[#BF8B36] flex items-center justify-center font-bold text-xs border border-[#BF8B36]/40 uppercase">
                      {user.name.charAt(0)}
                    </span>
                  </button>
                </div>

                {/* Profile Dropdown menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-white border border-[#E5DFD3] rounded-2xl shadow-xl py-2 z-40 origin-top-right text-xs"
                      >
                        <div className="px-4 py-2 border-b border-[#E5DFD3] mb-1">
                          <p className="font-bold text-[#181E1A] truncate">{user.name}</p>
                          <p className="text-[10px] font-mono text-[#BF8B36] uppercase font-bold tracking-wider">
                            {user.role.replace("_", " ")}
                          </p>
                        </div>

                        <Link 
                          href={getDashboardHref()} 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[#181E1A] hover:bg-[#E6F0EB] hover:text-[#194331] font-bold transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#194331]" />
                          {user.role === "SUPER_ADMIN" ? "Super Admin Portal" : user.role === "MASJID_ADMIN" ? "Masjid Admin Portal" : "My Dashboard"}
                        </Link>
                        

                        {user.role === "USER" && (
                          <Link 
                            href="/dashboard/saved-masjids" 
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[#525E56] hover:bg-[#E6F0EB] transition"
                          >
                            <Heart className="w-4 h-4 text-[#BF8B36]" />
                            Saved Masjids
                          </Link>
                        )}

                        <div className="w-full h-px bg-[#E5DFD3] my-1"></div>

                        <button
                          onClick={handleLogout}
                          type="button"
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 text-left transition cursor-pointer font-bold"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          Log out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Unauthenticated actions
              <>
                <Link 
                  href="/auth/login" 
                  className="text-xs font-bold text-[#194331] hover:text-[#113224] px-3 py-2 transition"
                >
                  Log in
                </Link>
                <Link 
                  href="/auth/register" 
                  className="text-xs font-bold bg-[#194331] text-white hover:bg-[#113224] px-5 py-2.5 rounded-xl transition shadow-xs"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMMenuOpen(!mMenuOpen)}
            type="button"
            className="lg:hidden w-10 h-10 grid place-items-center rounded-xl border border-[#E5DFD3] cursor-pointer text-[#194331] bg-white"
            aria-label="Toggle menu"
          >
            {mMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[#E5DFD3] bg-[#F8F6F0] px-5 pb-6 overflow-hidden"
          >
            <MobileNavMenu closeMenu={() => setMMenuOpen(false)} />

            <div className="h-px bg-[#E5DFD3] my-3"></div>

            {user ? (
              <div className="flex flex-col gap-1.5 font-bold text-xs">
                <Link href={getDashboardHref()} onClick={() => setMMenuOpen(false)} className="py-2.5 px-4 bg-[#194331] text-white rounded-xl flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#BF8B36]" />
                  Portal ({user.name.split(" ")[0]})
                </Link>
                <button
                  onClick={() => { setMMenuOpen(false); handleLogout(); }}
                  type="button"
                  className="text-left py-2.5 px-4 text-red-600 flex items-center gap-2 cursor-pointer font-bold"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link 
                  href="/auth/login" 
                  onClick={() => setMMenuOpen(false)}
                  className="text-center py-2.5 border border-[#E5DFD3] rounded-xl font-bold bg-white text-[#194331] transition text-xs"
                >
                  Log in
                </Link>
                <Link 
                  href="/auth/register" 
                  onClick={() => setMMenuOpen(false)}
                  className="text-center py-2.5 bg-[#194331] text-white rounded-xl font-bold hover:bg-[#113224] transition text-xs"
                >
                  Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
