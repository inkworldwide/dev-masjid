"use client";

import React, { useState, useEffect, Suspense } from "react";
import AdSidebarColumn from "@/components/ads/AdSidebarColumn";
import { useSearchParams } from "next/navigation";
import { FlaskConical, ExternalLink } from "lucide-react";
import Link from "next/link";

interface InnerDynamicLayoutProps {
  page?: "inner" | "masjids" | "announcements" | "events" | "donations";
  initialAds?: any[];
  initialTestMode?: boolean;
  maxWidth?: string;
  sidebarTitle?: string;
  className?: string;
  masjidId?: string | null;
  children: React.ReactNode;
}

function InnerDynamicLayoutInner({
  page = "inner",
  initialAds,
  initialTestMode = false,
  maxWidth = "max-w-7xl",
  sidebarTitle = "COMMUNITY BUZZ",
  className = "",
  masjidId,
  children,
}: InnerDynamicLayoutProps) {
  const searchParams = useSearchParams();
  const isPreviewParam = searchParams.get("preview") === "true";

  const [ads, setAds] = useState<any[]>(initialAds || []);
  const [testMode, setTestMode] = useState<boolean>(initialTestMode || isPreviewParam);

  // Client-side synchronization to keep preview, live ads, and test mode reactive
  useEffect(() => {
    let isMounted = true;
    async function syncAds() {
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", page);
        if (isPreviewParam) queryParams.set("preview", "true");
        if (masjidId) queryParams.set("masjidId", masjidId);

        const res = await fetch(`/api/ads?${queryParams.toString()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAds(data.ads || []);
            if (data.testMode !== undefined) {
              setTestMode(Boolean(data.testMode) || isPreviewParam);
            }
          }
        }
      } catch (err) {
        // Fallback to initial ads
      }
    }

    syncAds();

    return () => {
      isMounted = false;
    };
  }, [page, isPreviewParam, masjidId]);

  const hasAds = ads && ads.length > 0;

  return (
    <>
      {/* 🧪 Admin Ads Buzz Test Mode / Preview Notice */}
      {testMode && (
        <div className="bg-[#BF8B36] text-[#194331] px-4 py-2 border-b border-[#A07228] text-center text-xs font-bold font-mono flex items-center justify-center gap-3 shadow-xs">
          <div className="flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4 text-[#194331] animate-bounce" />
            <span>ADS BUZZ TEST MODE ACTIVE (INNER PAGES)</span>
          </div>
          <span className="font-normal opacity-90 hidden md:inline">
            — {hasAds ? `Displaying ${ads.length} ad banner(s) for verification.` : "All ads disabled / absent. Layout is in full-width mode."}
          </span>
          <Link
            href="/super-admin/ads-buzz"
            className="inline-flex items-center gap-1 bg-[#194331] text-[#E5D2B0] px-2.5 py-0.5 rounded-full text-[11px] font-bold hover:bg-[#113224] transition ml-2"
          >
            <span>Ads Buzz Manager</span>
            <ExternalLink className="w-3 h-3 text-[#BF8B36]" />
          </Link>
        </div>
      )}

      {/* ── DYNAMIC INNER BODY LAYOUT ── */}
      {hasAds ? (
        /* When Ads Buzz ads are available, display alongside content in two-column grid on desktop, and below on mobile */
        <div className={`${maxWidth} mx-auto w-full px-4 sm:px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 items-start ${className}`}>
          <div className="min-w-0 w-full space-y-8">
            {children}
          </div>
          <AdSidebarColumn page={page} className="w-full" title={sidebarTitle} initialAds={ads} masjidId={masjidId} />
        </div>
      ) : (
        /* When no ads are available, expand to full width and collapse ad container completely (zero blank space) */
        <div className={`${maxWidth} mx-auto w-full px-4 sm:px-6 md:px-8 py-6 flex flex-col ${className}`}>
          <div className="min-w-0 w-full space-y-8">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

function InnerFallbackLayout({
  page = "inner",
  initialAds,
  maxWidth = "max-w-7xl",
  sidebarTitle = "COMMUNITY BUZZ",
  className = "",
  masjidId,
  children,
}: InnerDynamicLayoutProps) {
  const hasAds = initialAds && initialAds.length > 0;
  if (hasAds) {
    return (
      <div className={`${maxWidth} mx-auto w-full px-4 sm:px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 items-start ${className}`}>
        <div className="min-w-0 w-full space-y-8">{children}</div>
        <AdSidebarColumn page={page} className="w-full" title={sidebarTitle} initialAds={initialAds} masjidId={masjidId} />
      </div>
    );
  }
  return (
    <div className={`${maxWidth} mx-auto w-full px-4 sm:px-6 md:px-8 py-6 flex flex-col ${className}`}>
      <div className="min-w-0 w-full space-y-8">{children}</div>
    </div>
  );
}

export default function InnerDynamicLayout(props: InnerDynamicLayoutProps) {
  return (
    <Suspense fallback={<InnerFallbackLayout {...props} />}>
      <InnerDynamicLayoutInner {...props} />
    </Suspense>
  );
}
