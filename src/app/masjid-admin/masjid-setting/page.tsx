"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "../../admin/layout";
import {
  Building2,
  Users,
  Award,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Lock,
  Megaphone
} from "lucide-react";

interface SettingModuleCard {
  id: string;
  name: string;
  pageTitle: string;
  description: string;
  path: string;
  icon: any;
  key: string;
  tags: string[];
}

export default function MasjidSettingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user permissions", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

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

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const cards: SettingModuleCard[] = [
    {
      id: "masjid-details",
      name: "Masjid Details",
      pageTitle: "Mosque Profile & Details",
      description: "Manage mosque profile information, daily congregational Iqamah schedule, surrounding area landmarks, facilities, and contact coordinates.",
      path: "/masjid-admin/masjid-details",
      icon: Building2,
      key: "manage_profile",
      tags: ["Iqamah Schedule", "Landmarks", "Facilities", "Contact"],
    },
    {
      id: "committee-members",
      name: "Committee Members",
      pageTitle: "Committee Members Directory",
      description: "Manage elected committee members, executive designations, regular musallis, patron contributors, and member contact directory.",
      path: "/masjid-admin/members",
      icon: Users,
      key: "manage_members",
      tags: ["Executive Board", "Directory", "Musallis", "Contributors"],
    },
    {
      id: "staff-leadership",
      name: "Staff & Leadership",
      pageTitle: "Masjid Leadership & Staff Roles",
      description: "Organize religious leadership and operational personnel including Imams, Khateebs, Muazzins, accountants, and maintenance staff.",
      path: "/masjid-admin/staff",
      icon: Award,
      key: "manage_staff",
      tags: ["Imams & Khateebs", "Muazzins", "Staff Roster", "Tenure"],
    },
    {
      id: "roles-permissions",
      name: "Roles/Permissions",
      pageTitle: "Role & Permission Matrix (RBAC)",
      description: "Configure role-based access control (RBAC), operational module permissions, and administrative security governance matrix.",
      path: "/masjid-admin/roles",
      icon: ShieldAlert,
      key: "manage_staff",
      tags: ["RBAC Matrix", "Module Access", "Security", "Governance"],
    },
    {
      id: "admin-ads-buzz",
      name: "Admin Ads Buzz",
      pageTitle: "Ads Buzz Manager",
      description: "Manage advertisements, promotional sponsor banners, partner offers, and target destinations for your Masjid.",
      path: "/masjid-admin/ads-buzz",
      icon: Megaphone,
      key: "ads_buzz",
      tags: ["Ad Banners", "Sponsor Campaigns", "Live Preview", "Click Tracking"],
    },
  ];

  const visibleCards = cards.filter((card) => {
    if (isSuperAdmin) return true;
    if (card.id === "admin-ads-buzz") return true; // Always present under Masjid Setting
    return userModules.includes(card.key);
  });

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16 text-left">
        
        {/* Top Breadcrumb & Page Header */}
        <div className="border-b border-[#E5DFD3] pb-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Link href="/masjid-admin" className="hover:text-[#194331] transition">
              Dashboard Overview
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#194331] font-bold">Masjid Setting</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 bg-[#194331] text-white rounded-2xl shadow-sm">
                <Building2 className="w-8 h-8 text-[#BF8B36]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181E1A]">
                    Masjid Setting
                  </h1>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] uppercase tracking-wider">
                    {visibleCards.length} Operational Modules
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Configure mosque profile, prayer schedule, committee members, leadership staff, and role permissions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.path}
                className="group relative bg-white border border-[#E5DFD3] hover:border-[#BF8B36] rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Accent Top Border Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#194331] via-[#BF8B36] to-[#194331] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#194331]/5 border border-[#194331]/10 text-[#194331] group-hover:bg-[#194331] group-hover:text-[#BF8B36] grid place-items-center transition-all duration-300 shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {card.id === "admin-ads-buzz" && !userModules.includes(card.key) && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Restricted
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F8F6F0] text-slate-600 border border-[#E5DFD3]">
                        {card.pageTitle}
                      </span>
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#181E1A] group-hover:text-[#194331] transition-colors">
                      {card.name}
                    </h2>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed mt-2">
                      {card.description}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-[#F8F6F0] text-[#525E56] border border-[#E5DFD3]/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-5 mt-5 border-t border-[#E5DFD3]/70 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#194331] group-hover:text-[#BF8B36] transition-colors flex items-center gap-1.5">
                    Open {card.name}
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-[#F8F6F0] text-[#194331] group-hover:bg-[#194331] group-hover:text-[#BF8B36] grid place-items-center transition-all">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {visibleCards.length === 0 && !loading && (
          <div className="p-8 text-center bg-white border border-[#E5DFD3] rounded-3xl space-y-3">
            <Lock className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-serif font-bold text-slate-800 text-lg">No Permitted Modules</h3>
            <p className="text-xs text-slate-500 font-mono">
              Your administrator account has not been assigned permissions for any modules in this group.
            </p>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
