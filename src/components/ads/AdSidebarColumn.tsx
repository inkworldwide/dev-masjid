"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Megaphone, Sparkles } from "lucide-react";

interface AdItem {
  id: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  placement?: string;
  format?: "FULL_WIDTH" | "HALF_WIDTH" | "QUAD_GRID";
  isExclusive?: boolean;
}

interface AdSidebarColumnProps {
  page?: "home" | "inner" | "masjids" | "announcements" | "events" | "donations";
  className?: string;
  title?: string;
  initialAds?: AdItem[];
  masjidId?: string | null;
}

export default function AdSidebarColumn({ 
  page = "home", 
  className = "", 
  title = "FEATURED BUZZ",
  initialAds,
  masjidId
}: AdSidebarColumnProps) {
  const [ads, setAds] = useState<AdItem[]>(initialAds || []);
  const [loading, setLoading] = useState(!initialAds);

  useEffect(() => {
    if (initialAds !== undefined) {
      setAds(initialAds);
      setLoading(false);
      return;
    }
    async function loadAds() {
      try {
        const queryParams = new URLSearchParams();
        if (page) queryParams.set("page", page);
        if (masjidId) queryParams.set("masjidId", masjidId);

        const res = await fetch(`/api/ads?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setAds(data.ads || []);
        }
      } catch (err) {
        console.error("Ad loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAds();
  }, [page, masjidId, initialAds]);

  const handleAdClick = (ad: AdItem) => {
    if (ad.id) {
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id }),
      }).catch(() => {});
    }
    const rawUrl = (ad.targetUrl || "").trim();
    if (!rawUrl) return;
    const destination = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/")
      ? rawUrl
      : `https://${rawUrl}`;
    window.open(destination, "_blank", "noopener,noreferrer");
  };

  if (loading || ads.length === 0) {
    return null;
  }

  // Check for Exclusive Solo Ad Takeover
  const exclusiveAd = ads.find((a) => a.isExclusive);

  if (exclusiveAd) {
    return (
      <aside className={`w-full font-sans text-left sticky top-24 self-start ${className}`}>
        {/* Sidebar Header Badge */}
        <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5 mb-3 px-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#194331]">
            <Megaphone className="w-4 h-4 text-[#BF8B36]" />
            <span>{title}</span>
          </div>
          <span className="text-[9px] font-mono font-bold bg-[#BF8B36] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
            <Sparkles className="w-3 h-3 fill-white" />
            EXCLUSIVE
          </span>
        </div>

        {/* Full-Height Vertical Takeover Poster Card */}
        <div
          onClick={() => handleAdClick(exclusiveAd)}
          className="group relative w-full h-[550px] min-h-[520px] max-h-[780px] rounded-3xl overflow-hidden border border-[#194331]/30 shadow-xl hover:shadow-2xl transition-all duration-500 bg-[#0F291E] cursor-pointer flex flex-col justify-between"
        >
          {/* Full Height Background Image */}
          <img
            src={exclusiveAd.imageUrl}
            alt={exclusiveAd.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-100 group-hover:brightness-105 contrast-[1.02]"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80";
            }}
          />

          {/* Multi-Stop Bottom Dark Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0F291E] via-[#0F291E]/60 to-transparent z-10 p-6 flex flex-col justify-between pointer-events-none" />

          {/* Top Floating Badge */}
          <div className="relative z-20 flex justify-between items-center p-5">
            <span className="bg-[#BF8B36] backdrop-blur-md text-[#194331] text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-[#E5D2B0]">
              <Sparkles className="w-3 h-3 fill-[#194331]" />
              Official Partner
            </span>
            <div className="w-8 h-8 rounded-full bg-[#BF8B36] text-[#194331] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition duration-300">
              <ExternalLink className="w-4 h-4 font-bold" />
            </div>
          </div>

          {/* Bottom Prominent Title & Call To Action Button */}
          <div className="relative z-20 p-6 space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#E5D2B0] uppercase tracking-widest bg-[#194331]/80 px-2.5 py-1 rounded-md border border-[#BF8B36]/30 inline-block">
                Featured Partner Offer
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug group-hover:text-[#BF8B36] transition-colors drop-shadow-md">
                {exclusiveAd.name}
              </h3>
            </div>

            <button className="w-full bg-[#BF8B36] hover:bg-[#A07228] text-[#194331] font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-2xl transition duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer">
              <span>View Exclusive Offer</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  const effectiveAds = ads;

  const adRows: { type: "FULL" | "HALF_PAIR" | "QUAD"; items: AdItem[] }[] = [];
  let i = 0;
  while (i < effectiveAds.length) {
    const current = effectiveAds[i];
    if (current.format === "QUAD_GRID") {
      const quadItems: AdItem[] = [current];
      let count = 1;
      while (count < 4 && i + count < effectiveAds.length && effectiveAds[i + count].format === "QUAD_GRID") {
        quadItems.push(effectiveAds[i + count]);
        count++;
      }
      adRows.push({ type: "QUAD", items: quadItems });
      i += count;
    } else if (current.format === "HALF_WIDTH") {
      const pair: AdItem[] = [current];
      if (i + 1 < effectiveAds.length && effectiveAds[i + 1].format === "HALF_WIDTH") {
        pair.push(effectiveAds[i + 1]);
        i += 2;
      } else {
        i += 1;
      }
      adRows.push({ type: "HALF_PAIR", items: pair });
    } else {
      adRows.push({ type: "FULL", items: [current] });
      i += 1;
    }
  }

  return (
    <aside className={`w-full space-y-4 font-sans text-left sticky top-24 self-start ${className}`}>
      {/* Sidebar Header Badge */}
      <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5 px-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#194331]">
          <Megaphone className="w-4 h-4 text-[#BF8B36]" />
          <span>{title}</span>
        </div>
        <span className="text-[9px] font-mono font-bold bg-[#FBF4E4] text-[#BF8B36] border border-[#E5D2B0] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#BF8B36] animate-pulse" />
          SPONSORED
        </span>
      </div>

      {/* Ad Rows Layout Stack */}
      <div className="flex flex-col gap-3.5">
        {adRows.map((row, rowIdx) => {
          if (row.type === "FULL") {
            const ad = row.items[0];
            return (
              <div
                key={ad.id || rowIdx}
                onClick={() => handleAdClick(ad)}
                className="group relative overflow-hidden rounded-2xl border border-[#E5DFD3] shadow-2xs hover:shadow-md hover:border-[#BF8B36]/60 transition-all duration-300 bg-[#0F291E] cursor-pointer"
              >
                <div className="relative aspect-[2.2/1] min-h-[125px] w-full overflow-hidden bg-slate-900">
                  <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-100 group-hover:brightness-105 contrast-[1.02]"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#0F291E]/95 via-[#0F291E]/50 to-transparent flex flex-col justify-end p-3.5 pointer-events-none">
                    <div className="flex items-center justify-between gap-2 pointer-events-auto">
                      <p className="text-xs font-bold text-white leading-snug font-serif line-clamp-2 group-hover:text-[#BF8B36] transition-colors drop-shadow-md">
                        {ad.name}
                      </p>
                      <div className="w-6.5 h-6.5 rounded-full bg-[#BF8B36] text-[#194331] flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-sm">
                        <ExternalLink className="w-3.5 h-3.5 font-bold" />
                      </div>
                    </div>
                    <span className="text-[9.5px] text-[#E5D2B0] font-mono font-bold mt-1 flex items-center gap-1 pointer-events-auto">
                      <span>Featured Promotion</span> • <span>Explore Deal →</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          if (row.type === "QUAD") {
            return (
              <div key={rowIdx} className="grid grid-cols-2 gap-2.5">
                {row.items.map((ad, idx) => {
                  const isFullSpan = row.items.length === 1 || (row.items.length === 3 && idx === 0);
                  return (
                    <div
                      key={ad.id}
                      onClick={() => handleAdClick(ad)}
                      className={`group relative overflow-hidden rounded-2xl border border-[#E5DFD3] hover:border-[#BF8B36]/60 shadow-2xs hover:shadow-md transition-all duration-300 bg-white cursor-pointer flex flex-col ${
                        isFullSpan ? "col-span-2" : ""
                      }`}
                    >
                      <div className={`relative w-full overflow-hidden bg-slate-100 ${isFullSpan ? "aspect-[2.2/1] min-h-[110px]" : "aspect-[1.4/1]"}`}>
                        <img
                          src={ad.imageUrl}
                          alt={ad.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#BF8B36] text-[#194331] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition">
                          <ExternalLink className="w-2.5 h-2.5 font-bold" />
                        </div>
                      </div>
                      <div className="p-2.5 bg-white text-[#181E1A] flex-1 flex flex-col justify-between space-y-1">
                        <p className="text-[11px] font-bold text-[#181E1A] leading-snug font-serif line-clamp-2 group-hover:text-[#BF8B36] transition-colors">
                          {ad.name}
                        </p>
                        <span className="text-[8.5px] text-[#194331] font-mono font-bold flex items-center gap-1 pt-0.5">
                          Special Offer →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={rowIdx} className="grid grid-cols-2 gap-2.5">
              {row.items.map((ad) => {
                const isSingle = row.items.length === 1;
                return (
                  <div
                    key={ad.id}
                    onClick={() => handleAdClick(ad)}
                    className={`group relative overflow-hidden rounded-2xl border border-[#E5DFD3] shadow-2xs hover:shadow-md hover:border-[#BF8B36]/60 transition-all duration-300 bg-white cursor-pointer flex flex-col ${
                      isSingle ? "col-span-2" : ""
                    }`}
                  >
                    <div className={`relative w-full overflow-hidden bg-slate-100 ${isSingle ? "aspect-[2.2/1] min-h-[110px]" : "aspect-[1.5/1]"}`}>
                      <img
                        src={ad.imageUrl}
                        alt={ad.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-[#BF8B36] text-[#194331] flex items-center justify-center shrink-0 group-hover:scale-110 transition shadow-2xs">
                        <ExternalLink className="w-2.5 h-2.5 font-bold" />
                      </div>
                    </div>
                    <div className="p-2.5 bg-white text-[#181E1A] flex-1 flex flex-col justify-between space-y-1">
                      <p className="text-[11px] font-bold text-[#181E1A] leading-snug font-serif line-clamp-2 group-hover:text-[#BF8B36] transition-colors">
                        {ad.name}
                      </p>
                      <span className="text-[8.5px] text-[#194331] font-mono font-bold mt-1">
                        Partner Offer • View →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
