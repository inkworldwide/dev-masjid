import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CommunityAdCard from "@/components/ads/CommunityAdCard";
import { prisma } from "@/lib/prisma";
import { Sparkles, Megaphone } from "lucide-react";
import { getAdminMasjidScope } from "@/lib/auth";

export const revalidate = 0;

export default async function PublicAdsBuzzPage() {
  let combinedAds: any[] = [];
  const adminMasjidId = await getAdminMasjidScope();

  try {
    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    const isTestMode = testModeSetting?.value === "true";

    const [advertisements, legacyCommunityAds] = await Promise.all([
      prisma.advertisement.findMany({
        where: {
          isActive: true,
          ...(isTestMode ? {} : { isTest: false }),
          ...(adminMasjidId ? { OR: [{ masjidId: adminMasjidId }, { masjidId: null }] } : {}),
        },
        include: {
          masjid: {
            select: { id: true, name: true, location: true },
          },
        },
        orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.communityAd.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    combinedAds = [...advertisements, ...legacyCommunityAds];
  } catch (err) {
    console.error("Ads Buzz directory fetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-5 md:px-8 py-10 space-y-8 w-full">
        {/* Header */}
        <div className="border-b border-[#E5DFD3] pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#BF8B36] uppercase font-mono">
            <Sparkles className="w-4 h-4 text-[#BF8B36]" /> Ads Buzz Directory
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#181E1A]">
            Verified Committee Sponsors & Services
          </h1>
          <p className="text-xs text-[#525E56]">
            Explore Hajj & Umrah operators, Islamic publishers, Mosque interior sound & carpet engineering, Halal caterers, and community partner announcements.
          </p>
        </div>

        {combinedAds.length === 0 ? (
          <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
            No active committee sponsors listed at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combinedAds.map((ad) => (
              <CommunityAdCard key={ad.id} ad={ad} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
