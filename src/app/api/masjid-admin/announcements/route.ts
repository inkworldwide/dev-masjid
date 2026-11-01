import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getAdminMasjidScope } from "@/lib/auth";
import { AnnouncementCategory } from "@prisma/client";

function parseAnnouncementCategory(catStr: string): AnnouncementCategory {
  if (!catStr) return AnnouncementCategory.GENERAL;
  const upper = catStr.toUpperCase().replace(/\s+/g, "_");
  if (upper in AnnouncementCategory) {
    return AnnouncementCategory[upper as keyof typeof AnnouncementCategory];
  }
  if (upper.includes("JUMMAH") || upper.includes("PRAYER") || upper.includes("RAMADAN")) return AnnouncementCategory.PRAYER;
  if (upper.includes("MEDICAL") || upper.includes("CHARITY")) return AnnouncementCategory.CHARITY;
  if (upper.includes("ALERT") || upper.includes("URGENT") || upper.includes("IMPORTANT")) return AnnouncementCategory.IMPORTANT_NOTICE;
  if (upper.includes("COMMUNITY")) return AnnouncementCategory.COMMUNITY;
  return AnnouncementCategory.GENERAL;
}

export async function GET(req: Request) {
  try {
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

    if (!masjidId) return NextResponse.json({ announcements: [] });

    const announcements = await prisma.masjidAnnouncement.findMany({
      where: { masjidId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ announcements });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch announcements." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, category, description, isImportant } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and Description are required." }, { status: 400 });
    }

    const validatedCategory = parseAnnouncementCategory(category);

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

    const announcement = await prisma.masjidAnnouncement.create({
      data: {
        masjidId,
        title: title.trim(),
        category: validatedCategory,
        description: description.trim(),
        isImportant: isImportant || false,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (err: any) {
    console.error("Failed to create announcement:", err);
    return NextResponse.json({ error: err?.message || "Failed to create announcement." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Announcement ID required." }, { status: 400 });

    await prisma.masjidAnnouncement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete announcement." }, { status: 500 });
  }
}
