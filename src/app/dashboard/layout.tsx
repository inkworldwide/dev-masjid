"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, User, Heart, Building2, ChevronRight, Menu, ShieldAlert 
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/auth/login?callbackUrl=" + pathname);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#BF8B36] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-lg text-[#194331]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", path: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 py-8 gap-6">
        
        {/* Mobile menu toggle bar */}
        <div className="md:hidden flex items-center justify-between bg-white border border-[#E5DFD3] p-4 rounded-xl shadow-2xs">
          <span className="font-serif text-md font-semibold text-[#181E1A]">User Portal</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
            className="w-9 h-9 border border-[#E5DFD3] rounded-lg grid place-items-center cursor-pointer hover:bg-[#F8F6F0] text-[#181E1A]"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside className={`w-full md:w-64 bg-[#194331] border border-[#113224] rounded-3xl p-5 shadow-sm md:flex flex-col shrink-0 ${sidebarOpen ? "flex" : "hidden"}`}>
          <div className="px-3 py-2 border-b border-white/10 mb-4 text-left">
            <h3 className="font-serif font-bold text-white leading-snug">{user.name}</h3>
            <p className="text-[10px] font-mono text-[#BF8B36] uppercase font-bold mt-0.5">{user.role.replace("_", " ")}</p>
          </div>

          <nav className="space-y-1.5 flex-1 text-left">
            {menuItems.map((item) => {
              const isCurrent = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition font-bold text-xs ${
                    isCurrent 
                      ? "bg-[#BF8B36] text-[#194331] shadow-md" 
                      : "text-slate-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCurrent ? "text-[#194331]" : "text-[#BF8B36]"}`} />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isCurrent ? "text-[#194331]" : "text-slate-400"}`} />
                </Link>
              );
            })}
          </nav>

          {(user.role === "SUPER_ADMIN" || user.role === "MASJID_ADMIN") && (
            <div className="pt-4 mt-6 border-t border-white/10">
              <Link
                href={user.role === "SUPER_ADMIN" ? "/super-admin" : "/masjid-admin/masjid-details"}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-[#BF8B36] text-[#194331] hover:bg-[#A07228] transition font-bold text-xs shadow-md"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Governance Portal</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content Pane */}
        <div className="flex-1 min-w-0 bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between">
          {children}
        </div>

      </div>
    </div>
  );
}
