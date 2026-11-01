import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page"); // "home", "inner", "masjids", "announcements", "events", "donations"
    const preview = searchParams.get("preview") === "true";
    const masjidId = searchParams.get("masjidId");
    const limit = Number(searchParams.get("limit")) || 30;

    let placementCondition: any = undefined;
    if (page === "home") {
      placementCondition = { in: ["HOME_ONLY", "BOTH"] };
    } else if (
      page === "inner" ||
      page === "masjids" ||
      page === "announcements" ||
      page === "events" ||
      page === "donations"
    ) {
      placementCondition = { in: ["INNER_ONLY", "BOTH", "PROPERTIES_ONLY", "PROPERTY_DETAIL_ONLY"] };
    }

    // Check system-wide Ads Buzz test mode setting
    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    const isTestMode = testModeSetting?.value === "true" || preview;

    const where: any = {
      isActive: true,
      ...(placementCondition ? { placement: placementCondition } : {}),
      ...(isTestMode ? {} : { isTest: false }),
    };

    if (masjidId) {
      where.OR = [
        { masjidId },
        { masjidId: null },
      ];
    }

    let advertisements = await prisma.advertisement.findMany({
      where,
      take: limit,
      include: {
        masjid: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    // If scoped query returned nothing, fallback to all active ads for this placement
    if (advertisements.length === 0 && masjidId) {
      const fallbackWhere = { ...where };
      delete fallbackWhere.OR;
      advertisements = await prisma.advertisement.findMany({
        where: fallbackWhere,
        take: limit,
        include: {
          masjid: {
            select: { id: true, name: true, location: true },
          },
        },
        orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
      });
    }

    // Also fetch legacy communityAds for backward compatibility if needed
    const communityAds = await prisma.communityAd.findMany({
      where: { status: "APPROVED" },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Unified ads list: advertisements first, fallback to legacy community ads
    const combinedAds = advertisements.length > 0 ? advertisements : communityAds;

    return NextResponse.json(
      {
        ads: combinedAds,
        advertisements,
        communityAds,
        testMode: isTestMode,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Public ads fetch error:", error);
    return NextResponse.json({ ads: [], advertisements: [], communityAds: [], testMode: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Ad ID required" }, { status: 400 });
    }

    await prisma.advertisement.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad click increment error:", error);
    return NextResponse.json({ error: "Failed to log ad click" }, { status: 500 });
  }
}
