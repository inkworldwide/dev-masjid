import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getAdminMasjidScope } from "@/lib/auth";
import { EventCategory } from "@prisma/client";

function parseEventCategory(catStr: string): EventCategory {
  if (!catStr) return EventCategory.LECTURE;
  const upper = catStr.toUpperCase().replace(/\s+/g, "_");
  if (upper in EventCategory) {
    return EventCategory[upper as keyof typeof EventCategory];
  }
  if (upper.includes("TAFSEER") || upper.includes("QURAN")) return EventCategory.QURANIC_CIRCLE;
  if (upper.includes("YOUTH") || upper.includes("WORKSHOP")) return EventCategory.YOUTH_PROGRAM;
  if (upper.includes("MADRASA")) return EventCategory.MADRASA_EVENT;
  if (upper.includes("CHARITY") || upper.includes("MEDICAL")) return EventCategory.CHARITY_DRIVE;
  if (upper.includes("COMMUNITY") || upper.includes("NIKKAH")) return EventCategory.COMMUNITY_GATHERING;
  return EventCategory.LECTURE;
}

function parseEventDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const trimmed = dateStr.trim();
  // Handle DD-MM-YYYY or DD/MM/YYYY format
  if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[-\/]/).map(Number);
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function purgeExpiredEvents() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    await prisma.masjidEvent.deleteMany({
      where: {
        OR: [
          { eventEndDate: { lt: startOfToday } },
          { AND: [{ eventEndDate: null }, { eventDate: { lt: startOfToday } }] },
        ],
      },
    });
  } catch (err) {
    console.error("Auto purge expired events error:", err);
  }
}

export async function GET(req: Request) {
  try {
    await purgeExpiredEvents();

    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      masjidId = await getAdminMasjidScope();
      if (!masjidId) {
        const firstMasjid = await prisma.masjid.findFirst();
        masjidId = firstMasjid?.id || null;
      }
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) return NextResponse.json({ events: [] });

    const events = await prisma.masjidEvent.findMany({
      where: { masjidId },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await purgeExpiredEvents();

    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, category, eventDate, eventEndDate, eventTime, location, speakerName, description, imageUrl } = body;

    if (!title || !eventDate) {
      return NextResponse.json({ error: "Title and Event Date are required." }, { status: 400 });
    }

    const parsedDate = parseEventDate(eventDate);
    const parsedEndDate = eventEndDate ? parseEventDate(eventEndDate) : parsedDate;
    const validatedCategory = parseEventCategory(category);

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      masjidId = await getAdminMasjidScope();
      if (!masjidId) {
        const firstMasjid = await prisma.masjid.findFirst();
        masjidId = firstMasjid?.id || null;
      }
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) {
      return NextResponse.json({ error: "No assigned Masjid found for this account." }, { status: 404 });
    }

    const event = await prisma.masjidEvent.create({
      data: {
        masjidId,
        title: title.trim(),
        category: validatedCategory,
        eventDate: parsedDate,
        eventEndDate: parsedEndDate,
        eventTime: eventTime ? eventTime.trim() : "7:30 PM",
        location: location ? location.trim() : "Main Prayer Hall",
        speakerName: speakerName ? speakerName.trim() : null,
        description: description ? description.trim() : "",
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("Failed to create event:", err);
    return NextResponse.json({ error: err?.message || "Failed to create event." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Event ID required." }, { status: 400 });

    await prisma.masjidEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}
