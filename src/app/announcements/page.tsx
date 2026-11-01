import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { Megaphone, Calendar, MapPin } from "lucide-react";

import { getAdminMasjidScope } from "@/lib/auth";
import InnerDynamicLayout from "@/components/ads/InnerDynamicLayout";

export const revalidate = 0;

export default async function PublicAnnouncementsPage() {
  let announcements: any[] = [];
  let innerAds: any[] = [];
  let isAdsTestMode = false;
  let adminMasjidId = null;

  try {
    adminMasjidId = await getAdminMasjidScope();
    
    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    isAdsTestMode = testModeSetting?.value === "true";

    const [announcementsRes, adsRes] = await Promise.all([
      prisma.masjidAnnouncement.findMany({
        where: adminMasjidId ? { masjidId: adminMasjidId } : undefined,
        include: { masjid: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.advertisement.findMany({
        where: {
          isActive: true,
          placement: { in: ["INNER_ONLY", "BOTH", "PROPERTIES_ONLY", "PROPERTY_DETAIL_ONLY"] },
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

    announcements = announcementsRes;
    innerAds = adsRes;
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <main className="flex-grow py-6 w-full">
        <InnerDynamicLayout page="announcements" initialAds={innerAds} initialTestMode={isAdsTestMode} masjidId={adminMasjidId}>
          <div className="border-b border-[#E5DFD3] pb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#BF8B36] uppercase font-mono">
              <Megaphone className="w-4 h-4 text-[#BF8B36]" /> Public Notices
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#181E1A]">
              Committee & Masjid Announcements
            </h1>
            <p className="text-xs text-[#525E56]">
              Stay informed with verified prayer notices, committee events, and urgent updates.
            </p>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
              No active announcements found at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {announcements.map((anc) => (
                <div key={anc.id} className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase bg-[#FBF4E4] px-3 py-1 rounded-full border border-[#E5D2B0]">
                      {anc.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(anc.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#181E1A]">{anc.title}</h3>
                  <p className="text-xs text-[#525E56] flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#BF8B36]" /> {anc.masjid?.name}
                  </p>

                  <p className="text-xs text-[#7D8A82] leading-relaxed font-light pt-2 border-t border-[#E5DFD3]/60">
                    {anc.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </InnerDynamicLayout>
      </main>

      <Footer />
    </div>
  );
}
