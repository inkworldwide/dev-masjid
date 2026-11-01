"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, HeartHandshake, Calendar, Heart, 
  ChevronRight, User, ShieldCheck, MapPin, ExternalLink,
  Clock, CheckCircle2
} from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  masjidId?: string | null;
  masjid?: {
    id: string;
    name: string;
    slug: string;
    address: string;
    location: string;
    coverImage?: string;
    status: string;
    city?: {
      name: string;
    } | null;
  } | null;
}

export default function DashboardOverview() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) return;
        const meData = await meRes.json();
        setUser(meData.user);
      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 justify-center flex-1">
        <div className="w-8 h-8 border-3 border-[#BF8B36] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Loading portal details...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="bg-[#F8F6F0] border border-[#E5DFD3] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#181E1A] font-extrabold">
            Welcome back, {user.name.split(" ")[0]}!
          </h2>
          <p className="text-xs text-[#525E56] mt-1">
            Community Musalli Portal — real-time prayer schedule, mosque updates, and contribution details.
          </p>
        </div>

        <div className="bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-3.5 py-1.5 rounded-full text-xs font-bold font-mono uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#194331]" />
          <span>{user.role.replace("_", " ")}</span>
        </div>
      </div>

      {/* 🕌 MY ASSOCIATED MASJID (View-Only Community Card) */}
      {user.masjid && (
        <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD3] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F0EB] border border-[#B7D4C5] flex items-center justify-center text-[#194331]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#BF8B36] tracking-wider">
                    My Associated Mosque
                  </span>
                  <span className="bg-[#E6F0EB] text-[#194331] text-[10px] font-bold px-2 py-0.2 rounded-full border border-[#B7D4C5] inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#181E1A] mt-0.5">{user.masjid.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/masjids/${user.masjid.slug || user.masjid.id}`}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/donations?masjidId=${user.masjid.id}`}
                className="px-4 py-2 bg-[#194331] hover:bg-[#113224] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#BF8B36]" />
                <span>Support / Donate</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="flex items-start gap-2 bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
              <MapPin className="w-4 h-4 text-[#BF8B36] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#181E1A] block">Location & Address</span>
                <span>{user.masjid.address || user.masjid.location || "Local area"}</span>
                {user.masjid.city?.name && (
                  <span className="block text-slate-500 font-medium">{user.masjid.city.name}</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 bg-[#F8F6F0] p-3 rounded-xl border border-[#E5DFD3]">
              <Clock className="w-4 h-4 text-[#BF8B36] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#181E1A] block">Musalli Community Status</span>
                <span>Active Musalli with direct donation and view access to this Masjid.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link href="/masjids" className="group bg-white border border-[#E5DFD3] hover:border-[#BF8B36] rounded-2xl p-5 shadow-2xs transition-all cursor-pointer space-y-3">
          <div className="flex items-start justify-between">
            <Building2 className="w-8 h-8 text-[#BF8B36]" />
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#BF8B36] transition" />
          </div>
          <div>
            <p className="font-serif text-base font-bold text-[#181E1A]">Explore Masjids</p>
            <p className="text-xs text-[#525E56] mt-0.5">Browse directory & prayer times</p>
          </div>
        </Link>

        <Link
          href={user.masjidId ? `/donations?masjidId=${user.masjidId}` : "/donations"}
          className="group bg-white border border-[#E5DFD3] hover:border-[#BF8B36] rounded-2xl p-5 shadow-2xs transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-start justify-between">
            <HeartHandshake className="w-8 h-8 text-[#BF8B36]" />
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#BF8B36] transition" />
          </div>
          <div>
            <p className="font-serif text-base font-bold text-[#181E1A]">Sadaqah & Zakat</p>
            <p className="text-xs text-[#525E56] mt-0.5">Support active Masjid funds</p>
          </div>
        </Link>

        <Link href="/events" className="group bg-white border border-[#E5DFD3] hover:border-[#BF8B36] rounded-2xl p-5 shadow-2xs transition-all cursor-pointer space-y-3">
          <div className="flex items-start justify-between">
            <Calendar className="w-8 h-8 text-[#BF8B36]" />
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#BF8B36] transition" />
          </div>
          <div>
            <p className="font-serif text-base font-bold text-[#181E1A]">Upcoming Events</p>
            <p className="text-xs text-[#525E56] mt-0.5">Quran circles & lectures</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
