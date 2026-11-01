import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { 
  Building2, MapPin, Phone, ShieldCheck, HeartHandshake, FileText, 
  Bus, Train, Plane, Navigation, CheckCircle2, Video, Calendar, ArrowLeft, Clock,
  ExternalLink
} from "lucide-react";
import MasjidDonationWidget, { SupportDonateButton } from "@/components/masjid/MasjidDonationWidget";
import InnerDynamicLayout from "@/components/ads/InnerDynamicLayout";

export const revalidate = 0;

export default async function MasjidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let masjid: any = null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    masjid = await prisma.masjid.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        city: true,
        documents: { where: { visibility: "PUBLIC" } },
        events: { take: 3 },
        announcements: { take: 3 },
        campaigns: { where: { status: "ACTIVE" }, take: 2 },
        staff: true,
      },
    });
  } catch (err) {
    console.error(err);
  }

  if (!masjid) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto px-5 py-20 text-center space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#181E1A]">Masjid Not Found</h2>
          <p className="text-xs text-[#525E56]">The requested Masjid record could not be found in the directory.</p>
          <Link href="/masjids" className="inline-block bg-[#194331] text-white font-bold text-xs px-5 py-2.5 rounded-xl">
            ← Back to Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Ensure active campaign exists for donation
  let rawCampaigns = masjid.campaigns || [];
  if (!rawCampaigns || rawCampaigns.length === 0) {
    try {
      const existing = await prisma.donationCampaign.findFirst({
        where: { masjidId: masjid.id, status: "ACTIVE" }
      });
      if (existing) {
        rawCampaigns = [existing];
      } else {
        const created = await prisma.donationCampaign.create({
          data: {
            masjidId: masjid.id,
            title: `${masjid.name} General Welfare & Maintenance Fund`,
            purpose: "General operational expenses, facility maintenance, and community welfare.",
            category: "GENERAL_FUND",
            goalAmount: 500000,
            raisedAmount: 0,
            status: "ACTIVE",
          }
        });
        rawCampaigns = [created];
      }
    } catch (e) {
      console.error("Failed to resolve default campaign", e);
    }
  }

  // Convert Decimal and non-plain objects to plain serializable objects for Client Components
  const displayCampaigns = (rawCampaigns || []).map((c: any) => ({
    id: String(c.id),
    masjidId: c.masjidId ? String(c.masjidId) : null,
    title: String(c.title || ""),
    purpose: c.purpose ? String(c.purpose) : null,
    coverImage: c.coverImage ? String(c.coverImage) : null,
    images: Array.isArray(c.images) ? c.images : [],
    category: String(c.category || "GENERAL_FUND"),
    goalAmount: Number(c.goalAmount || 500000),
    raisedAmount: Number(c.raisedAmount || 0),
    startDate: c.startDate ? (typeof c.startDate === "string" ? c.startDate : c.startDate.toISOString?.() || String(c.startDate)) : null,
    endDate: c.endDate ? (typeof c.endDate === "string" ? c.endDate : c.endDate.toISOString?.() || String(c.endDate)) : null,
    status: String(c.status || "ACTIVE"),
    createdAt: c.createdAt ? (typeof c.createdAt === "string" ? c.createdAt : c.createdAt.toISOString?.() || String(c.createdAt)) : null,
    updatedAt: c.updatedAt ? (typeof c.updatedAt === "string" ? c.updatedAt : c.updatedAt.toISOString?.() || String(c.updatedAt)) : null,
  }));

  let innerAds: any[] = [];
  let isAdsTestMode = false;
  try {
    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    isAdsTestMode = testModeSetting?.value === "true";

    innerAds = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        placement: { in: ["INNER_ONLY", "BOTH", "PROPERTIES_ONLY", "PROPERTY_DETAIL_ONLY"] },
        ...(isAdsTestMode ? {} : { isTest: false }),
        OR: [{ masjidId: masjid.id }, { masjidId: null }],
      },
      include: {
        masjid: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (e) {
    console.error("Failed to fetch inner ads for masjid detail", e);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0]">
      <Navbar />

      <main className="flex-grow py-6 w-full">
        <InnerDynamicLayout page="masjids" initialAds={innerAds} initialTestMode={isAdsTestMode} masjidId={masjid.id} sidebarTitle={`${masjid.name} BUZZ`}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/masjids" className="hover:text-[#BF8B36] flex items-center gap-1 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Directory
            </Link>
            <span>/</span>
            <span className="text-[#181E1A] font-bold">{masjid.name}</span>
          </div>

        {/* Hero Header Card (Side-by-side) */}
        <div className="bg-white border border-[#E5DFD3] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-0">
          
          {/* Image Side */}
          <div className="relative h-72 sm:h-96 lg:h-full bg-slate-100 min-h-[300px]">
            <img 
              src={masjid.coverImage || "/images/hero-masjid.jpg"} 
              alt={masjid.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#FBF4E4] text-[#BF8B36] border border-[#E5D2B0] px-3 py-1.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Masjid
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase bg-[#FBF4E4] px-3 py-1 rounded-full border border-[#E5D2B0]">
                  Reg No: {masjid.registrationNo || "WAQF VERIFIED"}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#181E1A] mt-3">
                  {masjid.name}
                </h1>
                <p className="text-xs text-[#525E56] flex items-center gap-1.5 mt-2 font-semibold">
                  <MapPin className="w-4 h-4 text-[#BF8B36] shrink-0" /> {masjid.address}, {masjid.city?.name}, {masjid.state} - {masjid.pincode}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#525E56] leading-relaxed font-light line-clamp-3">
                {masjid.description}
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E5DFD3] space-y-0.5">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Plot Size</p>
                  <p className="text-sm font-bold text-[#181E1A]">{masjid.plotSize}</p>
                </div>
                <div className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E5DFD3] space-y-0.5">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Contact Number</p>
                  <p className="text-sm font-bold text-[#181E1A] flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#BF8B36]" /> {masjid.contactNumber}
                  </p>
                </div>
              </div>

              {/* Daily Prayer Times (Professional Grid) */}
              {(() => {
                const defaultPrayers = [
                  { id: "fajr", name: "Fajr", time: masjid.fajrTime || "05:15 AM", isActive: true, order: 1 },
                  { id: "dhuhr", name: "Dhuhr", time: masjid.dhuhrTime || "01:30 PM", isActive: true, order: 2 },
                  { id: "asr", name: "Asr", time: masjid.asrTime || "05:00 PM", isActive: true, order: 3 },
                  { id: "maghrib", name: "Maghrib", time: masjid.maghribTime || "07:15 PM", isActive: true, order: 4 },
                  { id: "isha", name: "Isha", time: masjid.ishaTime || "08:45 PM", isActive: true, order: 5 },
                  { id: "jummah", name: "Jummah", time: masjid.jummahTime || "01:45 PM", isActive: true, order: 6, isJummah: true },
                ];
                let displayPrayers = defaultPrayers;
                if (Array.isArray(masjid.dailyPrayers) && masjid.dailyPrayers.length > 0) {
                  displayPrayers = masjid.dailyPrayers
                    .filter((p: any) => p.isActive !== false && p.name && (p.startTime || p.time))
                    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                }

                return (
                  <div className="pt-4 mt-2 border-t border-[#E5DFD3] flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="text-[11px] font-bold text-[#181E1A] flex items-center gap-2 uppercase tracking-widest font-mono">
                        <Clock className="w-4 h-4 text-[#BF8B36]" /> Daily Iqamah Schedule
                      </h3>
                      {masjid.prayerTimingLink?.isActive && masjid.prayerTimingLink?.url && (
                        <a
                          href={masjid.prayerTimingLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold font-mono text-[#194331] hover:text-[#BF8B36] flex items-center gap-1 bg-[#FBF4E4] hover:bg-[#F3E5C8] border border-[#E5D2B0] px-2.5 py-1 rounded-lg transition"
                          title="Open external prayer timings link"
                        >
                          <span>{masjid.prayerTimingLink.label || "View Complete Prayer Timings"}</span>
                          <ExternalLink className="w-3 h-3 text-[#BF8B36]" />
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {displayPrayers.map((pt: any) => {
                        const isJummah = pt.name.toLowerCase().includes("jummah") || pt.name.toLowerCase().includes("juma") || pt.isJummah;
                        const startTime = pt.startTime || pt.time;
                        const hasEndTime = pt.endTimeMode === "TIME" && pt.endTime && pt.endTime !== "NA";
                        return (
                          <div key={pt.id || pt.name} className={`px-3 py-2.5 rounded-xl border flex flex-col justify-center space-y-0.5 ${isJummah ? 'bg-gradient-to-br from-[#FBF4E4] to-[#F3E5C8] border-[#E5D2B0] shadow-sm' : 'bg-[#F8F6F0] border-[#E5DFD3]'}`}>
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isJummah ? 'text-[#BF8B36]' : 'text-slate-500'}`}>{pt.name}</p>
                              {pt.endTimeMode === "NA" && (
                                <span className="text-[7.5px] font-mono font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-400">NA</span>
                              )}
                            </div>
                            <p className={`text-sm font-serif font-extrabold ${isJummah ? 'text-[#194331]' : 'text-[#181E1A]'}`}>
                              {hasEndTime ? `${startTime} – ${pt.endTime}` : startTime}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E5DFD3]">
              <SupportDonateButton
                masjidId={masjid.id}
                masjidName={masjid.name}
                campaign={displayCampaigns[0]}
                className="bg-[#194331] hover:bg-[#113224] text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-xs flex items-center gap-2 flex-1 justify-center sm:flex-none cursor-pointer"
              />
              {masjid.videoTourUrl && (
                <a
                  href={masjid.videoTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#E5DFD3] hover:bg-[#F8F6F0] text-[#181E1A] font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 flex-1 justify-center sm:flex-none"
                >
                  <Video className="w-4 h-4 text-[#BF8B36]" /> Video Tour
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Content Details */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 pt-4">
          
          {/* Main Column */}
          <div className="space-y-8">
            
            {/* 🚶 TRANSPORT & LOCATION DISTANCES */}
            <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
                <Navigation className="w-5 h-5 text-[#BF8B36]" /> Transport & Location Distances
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {masjid.busDistance && (
                  <div className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-[#E5DFD3] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase">Bus Station</p>
                      <p className="text-xs font-semibold text-[#181E1A]">{masjid.busDistance}</p>
                    </div>
                  </div>
                )}

                {masjid.trainDistance && (
                  <div className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-[#E5DFD3] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] flex items-center justify-center shrink-0">
                      <Train className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase">Railway Station</p>
                      <p className="text-xs font-semibold text-[#181E1A]">{masjid.trainDistance}</p>
                    </div>
                  </div>
                )}

                {masjid.metroDistance && (
                  <div className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-[#E5DFD3] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] flex items-center justify-center shrink-0">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase">Metro Station</p>
                      <p className="text-xs font-semibold text-[#181E1A]">{masjid.metroDistance}</p>
                    </div>
                  </div>
                )}

                {masjid.airportDistance && (
                  <div className="p-3.5 bg-[#F8F6F0] rounded-2xl border border-[#E5DFD3] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-[#BF8B36] uppercase">Airport</p>
                      <p className="text-xs font-semibold text-[#181E1A]">{masjid.airportDistance}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 🏘️ SURROUNDING AREA & LANDMARKS */}
            {(() => {
              const surrounding = (masjid.surroundingDetails as any) || {};
              const heading = surrounding.heading || "Surrounding Area & Landmarks";
              const overviewLabel = surrounding.overviewLabel || "Neighborhood Overview";
              const overviewDesc = surrounding.overviewDesc || masjid.surroundingAreaDesc || "Situated in a peaceful community environment with convenient access to markets and local transport.";
              const landmarksLabel = surrounding.landmarksLabel || "Nearby Landmarks";

              let formattedLandmarks = masjid.nearbyLandmarks || "Close to local educational institutions, Islamic bookshops, and community centers.";
              if (Array.isArray(surrounding.landmarks) && surrounding.landmarks.length > 0) {
                const activeLandmarks = surrounding.landmarks
                  .filter((l: any) => l.isActive !== false && l.name?.trim())
                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                
                if (activeLandmarks.length > 0) {
                  formattedLandmarks = activeLandmarks
                    .map((l: any) => (l.distance ? `${l.name} (${l.distance}${l.unit || "m"})` : l.name))
                    .join(", ");
                }
              }

              const link = surrounding.link;
              const showLink = link && link.isActive && link.url;

              return (
                <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                    <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#BF8B36]" /> {heading}
                    </h3>
                    {showLink && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-[#194331] hover:text-[#BF8B36] flex items-center gap-1 transition"
                      >
                        <span>{link.label || "Area Info"}</span>
                        <ExternalLink className="w-3 h-3 text-[#BF8B36]" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-3 text-xs text-[#525E56] font-light leading-relaxed">
                    <div>
                      <h4 className="font-bold text-[#181E1A] text-xs font-mono uppercase mb-1 text-[#BF8B36]">{overviewLabel}</h4>
                      <p className="whitespace-pre-line">{overviewDesc}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#181E1A] text-xs font-mono uppercase mb-1 text-[#BF8B36]">{landmarksLabel}</h4>
                      <p>{formattedLandmarks}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 🕌 FACILITIES AVAILABLE */}
            {(() => {
              let displayFacilities: string[] = [];
              if (Array.isArray(masjid.customFacilities) && masjid.customFacilities.length > 0) {
                displayFacilities = (masjid.customFacilities as any[])
                  .filter((f: any) => f.isActive !== false && f.name?.trim())
                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                  .map((f: any) => f.name.trim());
              } else if (Array.isArray(masjid.facilities) && masjid.facilities.length > 0) {
                displayFacilities = masjid.facilities as string[];
              } else {
                displayFacilities = [
                  "Women's Prayer Area",
                  "Wudu Area",
                  "Parking",
                  "Quran Classes",
                  "Library",
                  "Wheelchair Access",
                  "Funeral Facilities",
                ];
              }

              return (
                <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
                    <Building2 className="w-5 h-5 text-[#BF8B36]" /> Masjid Facilities
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {displayFacilities.map((f: string, idx: number) => (
                      <div key={idx} className="p-3 bg-[#E6F0EB] text-[#194331] border border-[#B7D4C5] rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#194331] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 📄 PUBLIC DOCUMENTS */}
            {masjid.documents?.length > 0 && (
              <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#181E1A] flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
                  <FileText className="w-5 h-5 text-[#BF8B36]" /> Public Verification Documents
                </h3>

                <div className="space-y-2">
                  {masjid.documents.map((doc: any) => (
                    <div key={doc.id} className="p-3.5 bg-[#F8F6F0] border border-[#E5DFD3] rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-[#BF8B36] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-[#181E1A] truncate">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.type} • Uploaded by {doc.uploadedBy}</p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#194331] text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shrink-0"
                      >
                        Download PDF
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Active Donation Campaigns Widget */}
            <MasjidDonationWidget 
              campaigns={displayCampaigns} 
              masjidName={masjid.name} 
              masjidId={masjid.id}
            />

            {/* Staff & Imams List */}
            {masjid.staff?.length > 0 && (
              <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-serif text-base font-bold text-[#181E1A] border-b border-[#E5DFD3] pb-2">
                  Mosque Leadership & Staff
                </h3>
                <div className="space-y-2 text-xs">
                  {masjid.staff.map((st: any) => (
                    <div key={st.id} className="p-3 bg-[#F8F6F0] rounded-xl border border-[#E5DFD3] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#181E1A]">{st.name}</p>
                        <p className="text-[10px] font-mono text-[#BF8B36] font-bold uppercase">{st.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
        </InnerDynamicLayout>
      </main>

      <Footer />
    </div>
  );
}
