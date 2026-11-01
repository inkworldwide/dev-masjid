"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  ShieldCheck, Database, LayoutGrid, Users, LayoutDashboard, 
  ChevronRight, Building2, FileText, HeartHandshake, Calendar, 
  Megaphone, ShieldAlert, Home, Settings, Sparkles, User, ClipboardCheck,
  Image as ImageIcon, LineChart, Landmark, Lock, ArrowLeft
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const activeItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [pathname]);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user.role !== "SUPER_ADMIN" && data.user.role !== "MASJID_ADMIN") {
            router.push("/dashboard");
          } else {
            setUser(data.user);
          }
        } else {
          router.push("/auth/login?callbackUrl=" + pathname);
        }
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    verifyAdmin();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#194331] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#BF8B36] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-lg text-slate-200">Verifying Admin Privileges...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const superAdminMenu = [
    { name: "Dashboard Overview", path: "/super-admin", icon: LayoutDashboard },
    { name: "Verification Queue", path: "/super-admin/verifications", icon: ClipboardCheck },
    { name: "Masjids Directory", path: "/super-admin/masjids", icon: Building2 },
    { name: "Documents & Assets", path: "/super-admin/documents", icon: FileText },
    { name: "Users List", path: "/super-admin/users", icon: Users },
    { name: "Donations & Campaigns", path: "/super-admin/donations", icon: HeartHandshake },
    { name: "Ads Buzz", path: "/super-admin/ads-buzz", icon: Megaphone },
    { name: "Financial", path: "/super-admin/finance", icon: Landmark },
    { name: "Roles & Permissions", path: "/super-admin/rbac", icon: ShieldAlert },
    { name: "System Settings", path: "/super-admin/settings", icon: Settings },
  ];

  const masjidAdminMenuFull = [
    { name: "Dashboard Overview", path: "/masjid-admin", icon: LayoutDashboard, keys: ["view_dashboard"] },
    { name: "My Profile", path: "/admin/profile", icon: User, keys: ["manage_profile"] },
    { name: "Masjid Setting", path: "/masjid-admin/masjid-setting", icon: Building2, keys: ["manage_profile", "manage_members", "manage_staff"] },
    { name: "Activity Setting", path: "/masjid-admin/activity-setting", icon: Calendar, keys: ["manage_announcements", "manage_events", "manage_media"] },
    { name: "Assets Setting", path: "/masjid-admin/assets-setting", icon: LayoutGrid, keys: ["manage_documents", "manage_property"] },
    { name: "Donations & Campaigns", path: "/masjid-admin/donations", icon: HeartHandshake, keys: ["manage_donations"] },
    { name: "Financial", path: "/masjid-admin/finance", icon: Landmark, keys: ["manage_finances"] },
    { name: "Users List", path: "/masjid-admin/users", icon: Users, keys: ["manage_members"] },
    { name: "Analytics & Reports", path: "/masjid-admin/reports", icon: LineChart, keys: ["view_reports"] },
  ];

  // Determine permitted modules for Masjid Admin
  const defaultAdminModules = [
    "view_dashboard",
    "manage_profile",
    "manage_members",
    "manage_announcements",
    "manage_events",
    "manage_media",
    "manage_donations",
    "manage_finances",
    "manage_documents",
    "manage_staff",
    "manage_property",
    "view_reports",
    "ads_buzz"
  ];
  const userModules: string[] = (user?.enabledModules && user.enabledModules.length > 0)
    ? user.enabledModules
    : defaultAdminModules;

  const masjidAdminMenu = masjidAdminMenuFull.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.path === "/masjid-admin") return true; // Dashboard Overview is fundamental and ALWAYS visible for all Masjid Admins
    return item.keys.some((k) => userModules.includes(k));
  });

  const menuItems = isSuperAdmin ? superAdminMenu : masjidAdminMenu;

  const getIsActive = (itemPath: string) => {
    if (itemPath === "/masjid-admin" || itemPath === "/super-admin") {
      return pathname === itemPath;
    }
    if (itemPath === "/masjid-admin/masjid-setting") {
      return (
        pathname === "/masjid-admin/masjid-setting" ||
        pathname.startsWith("/masjid-admin/masjid-details") ||
        pathname.startsWith("/masjid-admin/members") ||
        pathname.startsWith("/masjid-admin/staff") ||
        pathname.startsWith("/masjid-admin/roles") ||
        pathname.startsWith("/masjid-admin/ads-buzz")
      );
    }
    if (itemPath === "/masjid-admin/activity-setting") {
      return (
        pathname === "/masjid-admin/activity-setting" ||
        pathname.startsWith("/masjid-admin/announcements") ||
        pathname.startsWith("/masjid-admin/events") ||
        pathname.startsWith("/masjid-admin/media")
      );
    }
    if (itemPath === "/masjid-admin/assets-setting") {
      return (
        pathname === "/masjid-admin/assets-setting" ||
        pathname.startsWith("/masjid-admin/documents") ||
        pathname.startsWith("/masjid-admin/properties")
      );
    }
    return pathname === itemPath || pathname.startsWith(itemPath + "/");
  };

  // Strict Page Access Control Guard
  let isAccessGranted = true;
  let currentRequiredKey: string | null = null;
  let currentModuleName = "";

  if (!isSuperAdmin) {
    if (pathname === "/masjid-admin") {
      currentRequiredKey = "view_dashboard";
      currentModuleName = "Dashboard Overview";
    } else if (pathname === "/masjid-admin/masjid-setting") {
      const hasAny = ["manage_profile", "manage_members", "manage_staff"].some((k) => userModules.includes(k));
      if (!hasAny) {
        currentRequiredKey = "manage_profile";
        currentModuleName = "Masjid Setting";
      }
    } else if (pathname === "/masjid-admin/activity-setting") {
      const hasAny = ["manage_announcements", "manage_events", "manage_media"].some((k) => userModules.includes(k));
      if (!hasAny) {
        currentRequiredKey = "manage_announcements";
        currentModuleName = "Activity Setting";
      }
    } else if (pathname === "/masjid-admin/assets-setting") {
      const hasAny = ["manage_documents", "manage_property"].some((k) => userModules.includes(k));
      if (!hasAny) {
        currentRequiredKey = "manage_documents";
        currentModuleName = "Assets Setting";
      }
    } else if (pathname.startsWith("/masjid-admin/masjid-details") || pathname.startsWith("/admin/profile")) {
      currentRequiredKey = "manage_profile";
      currentModuleName = "Mosque Details & Profile";
    } else if (pathname.startsWith("/masjid-admin/users")) {
      currentRequiredKey = "manage_members";
      currentModuleName = "Users List";
    } else if (pathname.startsWith("/masjid-admin/members")) {
      currentRequiredKey = "manage_members";
      currentModuleName = "Committee Members Directory";
    } else if (pathname.startsWith("/masjid-admin/announcements")) {
      currentRequiredKey = "manage_announcements";
      currentModuleName = "Announcements";
    } else if (pathname.startsWith("/masjid-admin/events")) {
      currentRequiredKey = "manage_events";
      currentModuleName = "Events & Classes";
    } else if (pathname.startsWith("/masjid-admin/media")) {
      currentRequiredKey = "manage_media";
      currentModuleName = "Media Gallery";
    } else if (pathname.startsWith("/masjid-admin/donations")) {
      currentRequiredKey = "manage_donations";
      currentModuleName = "Donations & Campaigns";
    } else if (pathname.startsWith("/masjid-admin/finance")) {
      currentRequiredKey = "manage_finances";
      currentModuleName = "Financial Ledger & Expenditures";
    } else if (pathname.startsWith("/masjid-admin/documents")) {
      currentRequiredKey = "manage_documents";
      currentModuleName = "Documents & Assets";
    } else if (pathname.startsWith("/masjid-admin/staff") || pathname.startsWith("/masjid-admin/roles")) {
      currentRequiredKey = "manage_staff";
      currentModuleName = "Staff & Leadership";
    } else if (pathname.startsWith("/masjid-admin/properties")) {
      currentRequiredKey = "manage_property";
      currentModuleName = "Property & Tenants";
    } else if (pathname.startsWith("/masjid-admin/reports")) {
      currentRequiredKey = "view_reports";
      currentModuleName = "Analytics & Financial Reports";
    } else if (pathname.startsWith("/masjid-admin/ads-buzz")) {
      currentRequiredKey = "ads_buzz";
      currentModuleName = "Ads Buzz Manager";
    }

    if (currentRequiredKey && !userModules.includes(currentRequiredKey)) {
      isAccessGranted = false;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0] font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1500px] mx-auto px-4 md:px-8 py-6 gap-6 items-stretch">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-[280px] bg-[#194331] text-slate-200 border border-[#113224] rounded-3xl p-4 md:p-4.5 shadow-xl shrink-0 flex flex-col justify-between md:sticky md:top-6 md:self-start max-h-[calc(100vh-3rem)] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#BF8B36_#113224]">
          <div>
            {/* Header Badge */}
            <div className="flex items-center gap-3 mb-4 px-1 pb-3 border-b border-[#113224]">
              <div className="w-9 h-9 rounded-2xl bg-[#BF8B36]/20 border border-[#BF8B36]/40 grid place-items-center text-[#BF8B36] font-bold text-lg shadow-xs shrink-0">
                🕌
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-sm tracking-tight leading-tight">
                  {isSuperAdmin ? "Super Admin" : (user?.masjidName || "Masjid Admin")}
                </h3>
                <p className="text-[9px] font-mono font-bold text-[#BF8B36] uppercase tracking-widest mt-0.5">
                  MOSQUE OPS PORTAL
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 mb-4">
              {menuItems.length === 0 ? (
                <div className="p-4 bg-[#113224] border border-[#BF8B36]/30 rounded-2xl text-center space-y-2">
                  <Lock className="w-5 h-5 text-[#BF8B36] mx-auto" />
                  <p className="text-xs font-serif font-bold text-white">No Permissions Granted</p>
                  <p className="text-[10px] font-mono text-slate-300 leading-tight">
                    Super Admin has not assigned portal modules to this mosque yet.
                  </p>
                </div>
              ) : (
                menuItems.map((item) => {
                const isCurrent = getIsActive(item.path);
                const Icon = item.icon;
                const isFinancial = item.name === "Financial";

                return (
                  <div key={item.path} className="space-y-1">
                    <Link
                      ref={isCurrent ? activeItemRef : null}
                      href={item.path}
                      className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs font-bold group ${
                        isCurrent 
                          ? "bg-[#BF8B36] text-[#194331] shadow-md shadow-[#BF8B36]/20 scale-[1.01]" 
                          : "text-slate-200 hover:bg-[#113224] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isCurrent ? "text-[#194331]" : "text-[#BF8B36] group-hover:text-white"}`} />
                        <span>{item.name}</span>
                      </div>
                      {isCurrent && <ChevronRight className={`w-3.5 h-3.5 text-[#194331] transition-transform ${isFinancial ? "rotate-90" : ""}`} />}
                    </Link>

                    {/* Financial Expandable Sub-Navigation */}
                    {isFinancial && isCurrent && (
                      <div className="pl-4 pr-1 py-1.5 space-y-1 border-l-2 border-[#BF8B36]/50 ml-4 animate-in slide-in-from-top-1">
                        <Link
                          href={`${item.path}/inflow`}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                            pathname.includes("/inflow")
                              ? "bg-white/20 text-white shadow-xs font-bold"
                              : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>1. Inflow Ledger</span>
                        </Link>

                        <Link
                          href={`${item.path}/expenditures`}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                            pathname.includes("/expenditures")
                              ? "bg-white/20 text-white shadow-xs font-bold"
                              : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span>2. Expenditure</span>
                        </Link>

                        <Link
                          href={`${item.path}/manual-audit`}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                            pathname.includes("/manual-audit")
                              ? "bg-white/20 text-white shadow-xs font-bold"
                              : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#BF8B36]"></span>
                          <span>3. Manual Audit</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            </nav>
          </div>

          {/* Bottom Return Button */}
          <div className="pt-4 border-t border-[#113224]">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-3 w-full rounded-2xl bg-black/20 hover:bg-black/40 text-slate-200 hover:text-white transition text-xs font-bold border border-white/10"
            >
              <Home className="w-4 h-4 text-[#BF8B36]" />
              <span>Public Community Home</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 w-full bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-xs text-left">
          {isAccessGranted ? (
            children
          ) : (
            <div className="py-16 px-6 text-center space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-3xl grid place-items-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full uppercase">
                  Access Restricted
                </span>
                <h2 className="font-serif text-2xl font-bold text-slate-900">
                  Permission Required
                </h2>
                <p className="text-xs text-slate-500 font-mono leading-relaxed">
                  Your administrator account does not have active permission to access the <strong>{currentModuleName}</strong> module.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href={menuItems[0]?.path || "/masjid-admin"}
                  className="inline-flex items-center justify-center gap-2 bg-[#194331] hover:bg-[#123325] text-white font-bold px-6 py-2.5 rounded-xl text-xs font-mono transition shadow cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#BF8B36]" />
                  <span>Return to Allowed Dashboard</span>
                </Link>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
