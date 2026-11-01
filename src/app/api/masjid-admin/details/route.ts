import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let masjidId: string | null = null;

    if (user.role === "SUPER_ADMIN") {
      const firstMasjid = await prisma.masjid.findFirst();
      masjidId = firstMasjid?.id || null;
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) {
      return NextResponse.json({ error: "No assigned Masjid found." }, { status: 404 });
    }

    const masjid = await prisma.masjid.findUnique({
      where: { id: masjidId },
      include: {
        city: true,
        staff: true,
        documents: true,
        events: true,
        announcements: true,
        properties: true,
      },
    });

    return NextResponse.json({ masjid });
  } catch (err) {
    console.error("Fetch masjid details error:", err);
    return NextResponse.json({ error: "Failed to fetch details." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      const firstMasjid = await prisma.masjid.findFirst();
      masjidId = firstMasjid?.id || null;
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) {
      return NextResponse.json({ error: "No assigned Masjid found." }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.contactNumber !== undefined) updateData.contactNumber = body.contactNumber;
    if (body.plotSize !== undefined) updateData.plotSize = body.plotSize;
    if (body.registrationNo !== undefined) updateData.registrationNo = body.registrationNo;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.pictures !== undefined) updateData.pictures = body.pictures;
    if (body.videoTourUrl !== undefined) updateData.videoTourUrl = body.videoTourUrl;
    if (body.busDistance !== undefined) updateData.busDistance = body.busDistance;
    if (body.trainDistance !== undefined) updateData.trainDistance = body.trainDistance;
    if (body.metroDistance !== undefined) updateData.metroDistance = body.metroDistance;
    if (body.airportDistance !== undefined) updateData.airportDistance = body.airportDistance;

    // 1. Dynamic Daily Iqamah Schedule
    if (body.dailyPrayers !== undefined) {
      updateData.dailyPrayers = body.dailyPrayers;
      if (Array.isArray(body.dailyPrayers)) {
        for (const p of body.dailyPrayers) {
          const lower = (p.name || "").toLowerCase().trim();
          const pTime = p.startTime || p.time;
          if (lower === "fajr") updateData.fajrTime = pTime;
          else if (lower === "dhuhr" || lower === "zuhr") updateData.dhuhrTime = pTime;
          else if (lower === "asr") updateData.asrTime = pTime;
          else if (lower === "maghrib") updateData.maghribTime = pTime;
          else if (lower === "isha") updateData.ishaTime = pTime;
          else if (lower === "jummah" || lower === "juma") updateData.jummahTime = pTime;
        }
      }
    }
    if (body.fajrTime !== undefined && !updateData.fajrTime) updateData.fajrTime = body.fajrTime;
    if (body.dhuhrTime !== undefined && !updateData.dhuhrTime) updateData.dhuhrTime = body.dhuhrTime;
    if (body.asrTime !== undefined && !updateData.asrTime) updateData.asrTime = body.asrTime;
    if (body.maghribTime !== undefined && !updateData.maghribTime) updateData.maghribTime = body.maghribTime;
    if (body.ishaTime !== undefined && !updateData.ishaTime) updateData.ishaTime = body.ishaTime;
    if (body.jummahTime !== undefined && !updateData.jummahTime) updateData.jummahTime = body.jummahTime;

    if (body.prayerTimingLink !== undefined) {
      if (body.prayerTimingLink?.url && typeof body.prayerTimingLink.url === "string" && body.prayerTimingLink.url.trim() !== "") {
        const urlStr = body.prayerTimingLink.url.trim();
        if (!/^https?:\/\//i.test(urlStr)) {
          return NextResponse.json({ error: "Prayer Timing URL must be a valid HTTP or HTTPS web link." }, { status: 400 });
        }
      }
      updateData.prayerTimingLink = body.prayerTimingLink;
    }

    // 2. Dynamic Surrounding Area & Landmarks
    if (body.surroundingDetails !== undefined) {
      if (body.surroundingDetails?.link?.url && typeof body.surroundingDetails.link.url === "string" && body.surroundingDetails.link.url.trim() !== "") {
        const urlStr = body.surroundingDetails.link.url.trim();
        if (!/^https?:\/\//i.test(urlStr)) {
          return NextResponse.json({ error: "Surrounding Area URL must be a valid HTTP or HTTPS web link." }, { status: 400 });
        }
      }
      updateData.surroundingDetails = body.surroundingDetails;
      if (body.surroundingDetails?.overviewDesc !== undefined) {
        updateData.surroundingAreaDesc = body.surroundingDetails.overviewDesc;
      }
      if (Array.isArray(body.surroundingDetails?.landmarks)) {
        const activeLandmarkStrings = body.surroundingDetails.landmarks
          .filter((l: any) => l.isActive !== false && l.name?.trim())
          .map((l: any) => l.distance ? `${l.name} (${l.distance}${l.unit || "m"})` : l.name);
        if (activeLandmarkStrings.length > 0) {
          updateData.nearbyLandmarks = activeLandmarkStrings.join(", ");
        }
      }
    } else {
      if (body.surroundingAreaDesc !== undefined) updateData.surroundingAreaDesc = body.surroundingAreaDesc;
      if (body.nearbyLandmarks !== undefined) updateData.nearbyLandmarks = body.nearbyLandmarks;
    }

    // 3. Dynamic Masjid Facilities
    if (body.customFacilities !== undefined) {
      updateData.customFacilities = body.customFacilities;
      if (Array.isArray(body.customFacilities)) {
        updateData.facilities = body.customFacilities
          .filter((f: any) => f.isActive !== false && f.name?.trim())
          .map((f: any) => f.name.trim());
      }
    } else if (body.facilities !== undefined) {
      updateData.facilities = body.facilities;
    }

    const updatedMasjid = await prisma.masjid.update({
      where: { id: masjidId },
      data: updateData,
    });

    return NextResponse.json({ success: true, masjid: updatedMasjid });
  } catch (err) {
    console.error("Update masjid details error:", err);
    return NextResponse.json({ error: "Failed to update details." }, { status: 500 });
  }
}
