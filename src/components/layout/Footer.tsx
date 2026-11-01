"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Send, HeartHandshake } from "lucide-react";
import { Logo } from "../ui/Logo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="bg-[#194331] text-slate-200 border-t border-[#BF8B36]/30">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 lg:grid-cols-[1.3fr_2fr] gap-12 lg:gap-16">
        
        {/* Left Column: Brand & Community Updates */}
        <div className="space-y-6">
          <Logo theme="dark" />
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed font-light">
            A trusted digital platform to discover Masjids, connect communities, explore announcements and events, and support Masjid initiatives.
          </p>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#BF8B36] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#BF8B36]" /> Subscribe to Community Announcements
            </h4>
            {submitted ? (
              <p className="text-xs text-emerald-300 font-medium bg-[#113224] border border-[#B7D4C5]/30 px-3.5 py-2.5 rounded-xl">
                ✓ JazakAllah Khair! You are now subscribed to community notices.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center max-w-sm">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-[#113224] border border-[#BF8B36]/40 rounded-xl pl-10 pr-28 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#BF8B36] transition"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  Subscribe <Send className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Platform Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h4 className="text-xs font-mono font-bold text-[#BF8B36] uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BF8B36] inline-block"></span> Navigation
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-300 font-medium">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/masjids" className="hover:text-white transition">Explore Masjids</Link></li>
              <li><Link href="/announcements" className="hover:text-white transition">Announcements</Link></li>
              <li><Link href="/events" className="hover:text-white transition">Upcoming Events</Link></li>
              <li><Link href="/donations" className="hover:text-white transition">Donation Campaigns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-[#BF8B36] uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BF8B36] inline-block"></span> Portals
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-300 font-medium">
              <li><Link href="/super-admin" className="hover:text-white transition">Super User Portal</Link></li>
              <li><Link href="/masjid-admin/masjid-details" className="hover:text-white transition">Masjid Admin Portal</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Community Dashboard</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition">Admin Login</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition">Community Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-[#BF8B36] uppercase tracking-widest flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BF8B36] inline-block"></span> Community
            </h4>
            <ul className="space-y-2.5 text-[13px] text-slate-300 font-medium">
              <li><span className="text-slate-400">Masjid Discovery</span></li>
              <li><span className="text-slate-400">Prayer Timings</span></li>
              <li><span className="text-slate-400">Zakat & Sadaqah</span></li>
              <li><span className="text-slate-400">Madrasa Education</span></li>
              <li><span className="text-slate-400">Community Welfare</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="border-t border-[#BF8B36]/20 bg-[#113224] py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} <span className="text-white font-serif font-bold">MOsQuE</span>. Masjid Management & Community Platform. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[#BF8B36] font-bold">
            <HeartHandshake className="w-4 h-4 text-[#BF8B36]" />
            <span>Serving the Ummah</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
