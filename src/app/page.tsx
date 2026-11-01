import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { 
  Building2, MapPin, Search, ShieldCheck, Heart, ArrowRight, 
  Calendar, Megaphone, HeartHandshake, Users, Clock, CheckCircle2
} from "lucide-react";

import { getAdminMasjidScope } from "@/lib/auth";
import HomeDynamicLayout from "@/components/home/HomeDynamicLayout";

export const revalidate = 0; // Dynamic data

export default async function HomePage() {
  let masjids: any[] = [];
  let events: any[] = [];
  let announcements: any[] = [];
  let campaigns: any[] = [];
  let cities: any[] = [];
  let homeAds: any[] = [];
  let isAdsTestMode = false;

  const adminMasjidId = await getAdminMasjidScope();

  try {
    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    isAdsTestMode = testModeSetting?.value === "true";

    const [masjidRes, eventRes, announcementRes, campaignRes, cityRes, adRes] = await Promise.all([
      prisma.masjid.findMany({
        where: { status: "VERIFIED" },
        include: { city: true },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.masjidEvent.findMany({
        include: { masjid: true },
        take: 4,
        orderBy: { eventDate: "asc" },
      }),
      prisma.masjidAnnouncement.findMany({
        include: { masjid: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.donationCampaign.findMany({
        where: { status: "ACTIVE" },
        include: { masjid: true },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.city.findMany({ take: 10 }),
      prisma.advertisement.findMany({
        where: {
          isActive: true,
          placement: { in: ["HOME_ONLY", "BOTH"] },
          ...(isAdsTestMode ? {} : { isTest: false }),
          ...(adminMasjidId ? { OR: [{ masjidId: adminMasjidId }, { masjidId: null }] } : {}),
        },
        include: {
          masjid: {
            select: { id: true, name: true, location: true },
          },
        },
        orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    masjids = masjidRes;
    if (adminMasjidId) {
      masjids.sort((a, b) => (a.id === adminMasjidId ? -1 : b.id === adminMasjidId ? 1 : 0));
    }

    events = eventRes;
    if (adminMasjidId) {
      events.sort((a, b) => (a.masjidId === adminMasjidId ? -1 : b.masjidId === adminMasjidId ? 1 : 0));
    }

    announcements = announcementRes;
    if (adminMasjidId) {
      announcements.sort((a, b) => (a.masjidId === adminMasjidId ? -1 : b.masjidId === adminMasjidId ? 1 : 0));
    }

    campaigns = campaignRes;
    if (adminMasjidId) {
      campaigns.sort((a, b) => (a.masjidId === adminMasjidId ? -1 : b.masjidId === adminMasjidId ? 1 : 0));
    }

    cities = cityRes;
    homeAds = adRes;

    // Fallback: If no scoped ads found for the specific masjid, fetch all active platform home ads
    if (homeAds.length === 0) {
      homeAds = await prisma.advertisement.findMany({
        where: {
          isActive: true,
          placement: { in: ["HOME_ONLY", "BOTH"] },
          ...(isAdsTestMode ? {} : { isTest: false }),
        },
        include: {
          masjid: {
            select: { id: true, name: true, location: true },
          },
        },
        orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      });
    }
  } catch (err) {
    console.error("Home page data fetch error:", err);
  }

  const adminMasjid = adminMasjidId ? masjids.find(m => m.id === adminMasjidId) || null : null;
  const isAdminView = !!adminMasjid;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <main className="flex-grow space-y-12 pb-20">
        
        {isAdminView ? (
          /* 🕌 ADMIN MASJID SPECIFIC HERO */
          <section className="relative bg-[#194331] text-white pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <img 
                src={adminMasjid?.coverImage || "/images/hero-masjid.jpg"} 
                alt="Masjid Cover" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#194331] via-[#194331]/90 to-[#194331]/70"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10 text-center space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#FBF4E4]/10 text-[#E5D2B0] border border-[#BF8B36]/30 px-5 py-2 rounded-full text-xs font-bold font-mono tracking-wider uppercase backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#BF8B36]" /> Official Portal
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
                Welcome to <br />
                <span className="text-[#BF8B36]">{adminMasjid?.name}</span>
              </h1>

              <div className="flex items-center justify-center gap-2 text-sm sm:text-lg text-slate-200 font-medium">
                <MapPin className="w-5 h-5 text-[#BF8B36]" />
                {adminMasjid?.location}, {adminMasjid?.city?.name}
              </div>

              <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl mt-8">
                <p className="text-white/90 text-sm leading-relaxed font-light">
                  {adminMasjid?.description || "Manage your congregation, announcements, and events directly from this unified dashboard view."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/masjid-admin"
                  className="bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-sm px-8 py-4 rounded-xl transition shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/masjids/${adminMasjid?.id}`}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-4 rounded-xl transition border border-white/20 backdrop-blur-md"
                >
                  View Public Profile
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* 🕌 1. PLATFORM HERO SECTION */
          <section className="relative bg-[#194331] text-white pt-20 pb-20 md:pt-24 md:pb-24 overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BF8B36_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#113224] to-transparent opacity-50"></div>
            
            <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                
                <div className="flex-1 space-y-8 text-center lg:text-left pt-8 lg:pt-0">
                  <div className="inline-flex items-center gap-2 bg-[#FBF4E4]/10 text-[#E5D2B0] border border-[#BF8B36]/30 px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider uppercase backdrop-blur-md">
                    <span className="text-[#BF8B36]">🕌</span> Official Masjid & Committee Portal
                  </div>

                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.15]">
                    Connecting Communities, <br className="hidden sm:block" />
                    <span className="text-[#BF8B36] italic drop-shadow-sm">Empowering Masjids.</span>
                  </h1>

                  <p className="text-sm sm:text-lg text-slate-200/90 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                    A trusted digital platform to discover Masjids, connect communities, explore announcements and events, and support Masjid initiatives.
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                    <Link
                      href="/masjids"
                      className="bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-sm px-7 py-3.5 rounded-xl transition duration-200 shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <span>Explore Masjids</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#search-masjids"
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-white/20 transition backdrop-blur-md shadow-lg"
                    >
                      Find Near You
                    </a>
                  </div>

                  <div id="search-masjids" className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20 mt-8 max-w-2xl mx-auto lg:mx-0">
                    <form action="/masjids" method="GET" className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                        <input
                          type="text"
                          name="q"
                          placeholder="Masjid Name..."
                          className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs font-semibold text-white placeholder:text-white/60 focus:outline-none focus:border-[#BF8B36] focus:bg-white/20 transition"
                        />
                      </div>
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                        <input
                          type="text"
                          name="city"
                          placeholder="City or Area..."
                          className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-3 py-3 text-xs font-semibold text-white placeholder:text-white/60 focus:outline-none focus:border-[#BF8B36] focus:bg-white/20 transition"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-white text-[#194331] hover:bg-[#F8F6F0] font-bold text-xs py-3 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Search className="w-4 h-4 text-[#BF8B36]" />
                        <span>Search</span>
                      </button>
                    </form>
                  </div>
                </div>

                <div className="flex-1 w-full max-w-md lg:max-w-none mx-auto relative hidden md:block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#BF8B36]/30 to-[#BF8B36]/10 blur-2xl rounded-full opacity-60"></div>
                  <div className="relative w-full aspect-[4/5] rounded-[100px_100px_32px_32px] overflow-hidden border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <img 
                      src="/images/hero-masjid.jpg" 
                      alt="Grand Mosque Interior" 
                      className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#194331]/90 via-[#194331]/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                      <div className="w-12 h-12 bg-[#BF8B36] rounded-full flex items-center justify-center shrink-0 shadow-lg">
                        <Heart className="w-6 h-6 text-[#194331]" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Empowering Communities</p>
                        <p className="text-white/80 text-xs font-light">Join thousands of members today</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-10 -right-6 w-24 h-24 bg-[#BF8B36] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── DYNAMIC LAYOUT: COMMUNITY SECTIONS & ADS BUZZ SIDEBAR ── */}
        <HomeDynamicLayout initialAds={homeAds} initialTestMode={isAdsTestMode} masjidId={adminMasjidId}>
          
          {/* 📊 2. COMMUNITY METRICS KPI BAR */}
          <section className="w-full">
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 shadow-md grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-1">
                <p className="font-serif text-3xl font-extrabold text-[#194331]">6+</p>
                <p className="text-xs font-bold text-[#BF8B36] uppercase font-mono tracking-wider">Registered Masjids</p>
                <p className="text-[10px] text-slate-500">Verified Congregations</p>
              </div>
              <div className="text-center space-y-1 border-l border-slate-100">
                <p className="font-serif text-3xl font-extrabold text-[#194331]">12+</p>
                <p className="text-xs font-bold text-[#BF8B36] uppercase font-mono tracking-wider">Active Communities</p>
                <p className="text-[10px] text-slate-500">Across Metropolitan Cities</p>
              </div>
              <div className="text-center space-y-1 border-l border-slate-100">
                <p className="font-serif text-3xl font-extrabold text-[#194331]">15+</p>
                <p className="text-xs font-bold text-[#BF8B36] uppercase font-mono tracking-wider">Upcoming Events</p>
                <p className="text-[10px] text-slate-500">Quran Circles & Lectures</p>
              </div>
              <div className="text-center space-y-1 border-l border-slate-100">
                <p className="font-serif text-3xl font-extrabold text-[#194331]">4,500+</p>
                <p className="text-xs font-bold text-[#BF8B36] uppercase font-mono tracking-wider">Committee Members</p>
                <p className="text-[10px] text-slate-500">Connected & Supporting</p>
              </div>
            </div>
          </section>

          {/* 🕌 3. FEATURED MASJIDS DIRECTORY */}
          <section className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5DFD3] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#BF8B36] uppercase font-mono">
                  <Building2 className="w-4 h-4 text-[#BF8B36]" /> Directory
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#181E1A]">
                  Featured Verified Masjids
                </h2>
              </div>
              <Link
                href="/masjids"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#194331] hover:text-[#BF8B36] transition"
              >
                <span>View All Masjids</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masjids.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border border-[#E5DFD3] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#BF8B36] transition duration-200 group flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={m.coverImage}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#194331]" /> VERIFIED
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg font-bold text-[#181E1A] group-hover:text-[#BF8B36] transition line-clamp-1">
                        {m.name}
                      </h3>
                      <p className="text-xs text-[#525E56] flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#BF8B36] shrink-0" /> {m.location}, {m.city?.name}
                      </p>
                      <p className="text-xs text-[#7D8A82] line-clamp-2 leading-relaxed font-light">
                        {m.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        Plot: {m.plotSize}
                      </span>
                      <Link
                        href={`/masjids/${m.id}`}
                        className="bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 🤲 4. PREMIUM DONATIONS SECTION (#FBF4E4 Surface) */}
          {campaigns.length > 0 && (
            <section className="w-full">
              <div className="bg-[#FBF4E4] border border-[#E5D2B0] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5D2B0] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BF8B36] uppercase font-mono mb-1">
                      <HeartHandshake className="w-4 h-4 text-[#BF8B36]" /> Sadaqah & Zakat Initiatives
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#181E1A]">
                      Support Active {isAdminView ? "Campaigns" : "Masjid Campaigns"}
                    </h2>
                  </div>
                  <Link
                    href="/donations"
                    className="bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-2xs self-start sm:self-auto"
                  >
                    All Campaigns
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {campaigns.map((c) => {
                    const raised = Number(c.raisedAmount);
                    const goal = Number(c.goalAmount);
                    const progressPct = Math.min(Math.round((raised / goal) * 100), 100);

                    return (
                      <div key={c.id} className="bg-white border border-[#E5D2B0] rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase bg-[#FBF4E4] px-2.5 py-0.5 rounded-full border border-[#E5D2B0]">
                            {c.category.replace("_", " ")}
                          </span>
                          <h3 className="font-serif text-base font-bold text-[#181E1A] line-clamp-1">{c.title}</h3>
                          {!isAdminView && <p className="text-xs text-[#525E56] font-medium">{c.masjid?.name}</p>}
                          <p className="text-xs text-[#7D8A82] line-clamp-2 leading-relaxed font-light">{c.purpose}</p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-[#194331]">Raised: ₹{raised.toLocaleString("en-IN")}</span>
                              <span className="text-[#7D8A82]">Goal: ₹{goal.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#BF8B36] rounded-full" style={{ width: `${progressPct}%` }}></div>
                            </div>
                          </div>

                          <Link
                            href={`/masjids/${c.masjidId}`}
                            className="w-full bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs py-2.5 rounded-xl transition text-center block shadow-2xs"
                          >
                            Donate Now (Demo)
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* 📅 5. UPCOMING EVENTS & ANNOUNCEMENTS */}
          {(events.length > 0 || announcements.length > 0) && (
            <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Events */}
              <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#BF8B36]" /> Upcoming Events
                  </h3>
                  <Link href="/events" className="text-xs font-bold text-[#194331] hover:underline">
                    View Calendar →
                  </Link>
                </div>

                {events.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 font-mono py-6">No upcoming events.</div>
                ) : (
                  <div className="space-y-3">
                    {events.map((ev) => (
                      <div key={ev.id} className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-[#E5DFD3] flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#194331] text-[#BF8B36] flex flex-col items-center justify-center shrink-0 font-mono">
                          <span className="text-xs font-bold leading-none">{new Date(ev.eventDate).getDate()}</span>
                          <span className="text-[9px] uppercase font-semibold">{new Date(ev.eventDate).toLocaleString("default", { month: "short" })}</span>
                        </div>
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-[#181E1A] truncate">{ev.title}</h4>
                          {!isAdminView && <p className="text-[11px] text-[#525E56]">{ev.masjid?.name}</p>}
                          <p className="text-[10px] text-[#7D8A82] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#BF8B36]" /> {ev.eventTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Announcements */}
              <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-[#BF8B36]" /> Recent Announcements
                  </h3>
                  <Link href="/announcements" className="text-xs font-bold text-[#194331] hover:underline">
                    All Notices →
                  </Link>
                </div>

                {announcements.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 font-mono py-6">No active announcements.</div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((anc) => (
                      <div key={anc.id} className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-[#E5DFD3] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-[#BF8B36] uppercase bg-[#FBF4E4] px-2 py-0.5 rounded border border-[#E5D2B0]">
                            {anc.category.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(anc.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#181E1A]">{anc.title}</h4>
                        <p className="text-[11px] text-[#525E56] line-clamp-2 leading-relaxed font-light">
                          {anc.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </section>
          )}

        </HomeDynamicLayout>

      </main>

      <Footer />
    </div>
  );
}
