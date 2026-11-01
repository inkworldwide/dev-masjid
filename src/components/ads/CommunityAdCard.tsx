"use client";

import React from "react";
import { Sparkles, Phone, ExternalLink, MapPin } from "lucide-react";

interface CommunityAdCardProps {
  ad: {
    id: string;
    title?: string;
    name?: string;
    sponsorName?: string;
    category?: string;
    description?: string | null;
    imageUrl: string;
    targetUrl?: string | null;
    location?: string | null;
    contactPhone?: string | null;
    masjid?: {
      name: string;
      location?: string;
    } | null;
  };
  compact?: boolean;
}

export default function CommunityAdCard({ ad, compact = false }: CommunityAdCardProps) {
  const displayTitle = ad.name || ad.title || "Community Advertisement";
  const displaySponsor = ad.sponsorName || ad.masjid?.name || "Verified Partner";
  const displayCategory = (ad.category || "SPONSORED").replace(/_/g, " ");
  const displayLocation = ad.location || ad.masjid?.location || null;

  const handleCardClick = () => {
    if (ad.id) {
      fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id }),
      }).catch(() => {});
    }
    if (ad.targetUrl) {
      const rawUrl = ad.targetUrl.trim();
      const destination = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("/")
        ? rawUrl
        : `https://${rawUrl}`;
      window.open(destination, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-[#E5D2B0] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition duration-200 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        <div className="relative h-40 overflow-hidden bg-slate-100">
          <img
            src={ad.imageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80";
            }}
          />
          <div className="absolute top-2.5 left-2.5 bg-[#FBF4E4] text-[#BF8B36] border border-[#E5D2B0] px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#BF8B36]" /> SPONSOR
          </div>
        </div>

        <div className="p-4 space-y-2 text-left">
          <span className="text-[9px] font-mono font-bold text-[#194331] bg-[#E6F0EB] px-2 py-0.5 rounded border border-[#B7D4C5] uppercase">
            {displayCategory}
          </span>

          <h4 className="font-serif text-sm font-bold text-[#181E1A] line-clamp-2 leading-snug group-hover:text-[#BF8B36] transition">
            {displayTitle}
          </h4>

          <p className="text-[11px] font-bold text-[#194331]">
            By {displaySponsor}
          </p>

          {!compact && ad.description && (
            <p className="text-[11px] text-[#7D8A82] line-clamp-2 font-light leading-relaxed">
              {ad.description}
            </p>
          )}

          {displayLocation && (
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
              <MapPin className="w-3 h-3 text-[#BF8B36]" /> {displayLocation}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 pt-0 border-t border-[#E5DFD3]/60 mt-2 flex items-center justify-between gap-2 text-xs">
        {ad.contactPhone ? (
          <span className="text-[11px] font-mono font-bold text-[#525E56] flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#BF8B36]" /> {ad.contactPhone}
          </span>
        ) : (
          <span className="text-[10px] font-mono font-bold text-[#BF8B36]">
            Featured Offer
          </span>
        )}

        {ad.targetUrl && (
          <button
            type="button"
            className="ml-auto bg-[#194331] hover:bg-[#113224] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Visit Offer</span>
            <ExternalLink className="w-3 h-3 text-[#BF8B36]" />
          </button>
        )}
      </div>
    </div>
  );
}
