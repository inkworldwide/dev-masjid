import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, MapPin, User } from "lucide-react";

import { getAdminMasjidScope } from "@/lib/auth";
import InnerDynamicLayout from "@/components/ads/InnerDynamicLayout";

export const revalidate = 0;

export default async function PublicEventsPage() {
  let events: any[] = [];
  let innerAds: any[] = [];
  let isAdsTestMode = false;
  let adminMasjidId = null;

  try {
    adminMasjidId = await getAdminMasjidScope();
    
    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    isAdsTestMode = testModeSetting?.value === "true";

    const [eventsRes, adsRes] = await Promise.all([
      prisma.masjidEvent.findMany({
        where: adminMasjidId ? { masjidId: adminMasjidId } : undefined,
        include: { masjid: true },
        orderBy: { eventDate: "asc" },
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

    events = eventsRes;
    innerAds = adsRes;
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <main className="flex-grow py-6 w-full">
        <InnerDynamicLayout page="events" initialAds={innerAds} initialTestMode={isAdsTestMode} masjidId={adminMasjidId}>
          <div className="border-b border-[#E5DFD3] pb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#BF8B36] uppercase font-mono">
              <Calendar className="w-4 h-4 text-[#BF8B36]" /> Event Schedule
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#181E1A]">
              Upcoming Quran Circles & Lectures
            </h1>
            <p className="text-xs text-[#525E56]">
              Join authentic Islamic lectures, youth programs, and committee gatherings.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
              No upcoming events scheduled at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div key={ev.id} className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#194331] uppercase bg-[#E6F0EB] px-3 py-1 rounded-full border border-[#B7D4C5]">
                        {ev.category.replace("_", " ")}
                      </span>
                      <span className="text-xs font-bold font-mono text-[#BF8B36]">
                        {new Date(ev.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-[#181E1A] line-clamp-2">{ev.title}</h3>
                    <p className="text-xs text-[#525E56] font-medium">{ev.masjid?.name}</p>
                    <p className="text-xs text-[#7D8A82] line-clamp-3 leading-relaxed font-light">{ev.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E5DFD3] space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#BF8B36]" />
                      <span>{ev.eventTime}</span>
                    </div>
                    {ev.speaker && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#BF8B36]" />
                        <span>By {ev.speaker}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#BF8B36]" />
                      <span className="truncate">{ev.masjid?.location}</span>
                    </div>
                  </div>
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
