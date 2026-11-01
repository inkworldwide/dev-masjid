"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import CommunityAdCard from "./CommunityAdCard";

export default function AdsBuzzSidebar() {
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAds() {
      try {
        const res = await fetch("/api/ads?limit=2");
        if (res.ok) {
          const data = await res.json();
          setAds(data.ads || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAds();
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5D2B0] pb-2">
        <h4 className="font-serif text-sm font-bold text-[#181E1A] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#BF8B36]" /> Ads Buzz Sponsors
        </h4>
        <Link href="/ads-buzz" className="text-[10px] font-bold text-[#194331] hover:underline flex items-center gap-0.5">
          <span>View All</span>
          <ArrowRight className="w-3 h-3 text-[#BF8B36]" />
        </Link>
      </div>

      <div className="space-y-4">
        {ads.map((ad) => (
          <CommunityAdCard key={ad.id} ad={ad} compact />
        ))}
      </div>
    </div>
  );
}
