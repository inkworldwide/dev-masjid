import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "MASJID_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
      return NextResponse.json({ error: "No Assigned Masjid found." }, { status: 404 });
    }

    const masjid = await prisma.masjid.findUnique({
      where: { id: masjidId },
    });

    if (!masjid) {
      return NextResponse.json({ error: "Masjid not found." }, { status: 404 });
    }

    // Generate a display ID (like MSJ-2026-0001) for the tenant context
    const tenantId = `MSJ-${new Date(masjid.createdAt).getFullYear()}-${masjid.id.substring(masjid.id.length - 4).toUpperCase()}`;

    // KPI Counts
    const communityMembersCount = await prisma.savedMasjid.count({ where: { masjidId } });
    const activeStaffCount = await prisma.masjidStaff.count({ where: { masjidId, status: "ACTIVE" } });
    const documentsCount = await prisma.masjidDocument.count({ where: { masjidId } });
    const propertiesCount = await prisma.masjidProperty.count({ where: { masjidId } });

    // Widgets Data (Recent Announcements and Events)
    const announcements = await prisma.masjidAnnouncement.findMany({
      where: { masjidId },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    const events = await prisma.masjidEvent.findMany({
      where: { masjidId },
      orderBy: { eventDate: "asc" },
      take: 2,
    });

    return NextResponse.json({
      success: true,
      data: {
        masjid: {
          id: masjid.id,
          name: masjid.name,
          address: masjid.address,
          pincode: masjid.pincode,
          tenantId,
        },
        kpis: {
          communityMembers: communityMembersCount,
          activeStaff: activeStaffCount,
          documents: documentsCount,
          properties: propertiesCount,
        },
        recentAnnouncements: announcements,
        upcomingEvents: events,
      }
    });
  } catch (err) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json({ error: "Failed to fetch dashboard data." }, { status: 500 });
  }
}
