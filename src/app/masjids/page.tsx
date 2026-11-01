import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { Search, MapPin, Building2, ShieldCheck, ArrowRight, Filter } from "lucide-react";

import { getAdminMasjidScope } from "@/lib/auth";
import InnerDynamicLayout from "@/components/ads/InnerDynamicLayout";

export const revalidate = 0;

export default async function MasjidsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const cityFilter = params.city || "";

  let masjids: any[] = [];
  let cities: any[] = [];
  let innerAds: any[] = [];
  let isAdsTestMode = false;
  
  const adminMasjidId = await getAdminMasjidScope();
  
  if (adminMasjidId) {
    redirect(`/masjids/${adminMasjidId}`);
  }

  try {
    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    isAdsTestMode = testModeSetting?.value === "true";

    const [masjidList, cityList, adsList] = await Promise.all([
      prisma.masjid.findMany({
        where: {
          status: "VERIFIED",
          AND: [
            query ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { location: { contains: query, mode: "insensitive" } },
                { pincode: { contains: query, mode: "insensitive" } },
              ],
            } : {},
            cityFilter ? {
              city: { name: { contains: cityFilter, mode: "insensitive" } },
            } : {},
          ],
        },
        include: { city: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.city.findMany(),
      prisma.advertisement.findMany({
        where: {
          isActive: true,
          placement: { in: ["INNER_ONLY", "BOTH", "PROPERTIES_ONLY", "PROPERTY_DETAIL_ONLY"] },
          ...(isAdsTestMode ? {} : { isTest: false }),
        },
        include: {
          masjid: {
            select: { id: true, name: true, location: true },
          },
        },
        orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      }),
    ]);

    masjids = masjidList;
    cities = cityList;
    innerAds = adsList;
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <main className="flex-grow py-6 w-full">
        <InnerDynamicLayout page="masjids" initialAds={innerAds} initialTestMode={isAdsTestMode}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DFD3] pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#BF8B36] uppercase font-mono mb-1">
                <Building2 className="w-4 h-4 text-[#BF8B36]" /> Directory
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#181E1A]">
                Explore Verified Masjids
              </h1>
              <p className="text-xs text-[#525E56] mt-1">
                Discover local congregations, daily prayer schedules, and community facilities.
              </p>
            </div>
            <p className="text-xs font-mono font-bold text-[#BF8B36] bg-[#FBF4E4] px-3.5 py-1.5 rounded-full border border-[#E5D2B0] self-start md:self-auto">
              {masjids.length} Masjids Found
            </p>
          </div>

          {/* Search & Filter Bar */}
          <form method="GET" className="bg-white p-4 rounded-2xl border border-[#E5DFD3] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search Masjid Name, Pincode..."
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-[#BF8B36] text-[#181E1A] font-medium"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="city"
                defaultValue={cityFilter}
                placeholder="City or Area..."
                className="w-full bg-[#F8F6F0] border border-[#E5DFD3] rounded-xl pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-[#BF8B36] text-[#181E1A] font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-4 h-4 text-[#BF8B36]" />
              <span>Apply Filters</span>
            </button>
          </form>

          {/* Grid List */}
          {masjids.length === 0 ? (
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-12 text-center text-xs text-slate-400 font-mono">
              No verified Masjids found matching your search.
            </div>
          ) : (
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
          )}
        </InnerDynamicLayout>
      </main>

      <Footer />
    </div>
  );
}
