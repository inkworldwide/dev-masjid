import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized Super Admin access." }, { status: 403 });
    }

    const [
      masjidAdditionRequests,
      masjidAdminApplications,
      pendingMasjids,
      pendingUsers,
      pendingDonations,
      pendingAnnouncements,
      pendingEvents,
      pendingProperties,
      pendingDocuments,
    ] = await Promise.all([
      prisma.masjidAdditionRequest.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.masjidAdminApplication.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.masjid.findMany({
        where: { status: "PENDING" },
        include: {
          admins: {
            include: { user: true },
          },
          city: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          isApproved: false,
          role: { in: ["USER", "MASJID_ADMIN"] },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.donationCampaign.findMany({
        where: {
          status: "PENDING",
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } },
          },
        },
        include: { masjid: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.masjidAnnouncement.findMany({
        where: {
          verificationStatus: "PENDING",
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } },
          },
        },
        include: { masjid: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.masjidEvent.findMany({
        where: {
          verificationStatus: "PENDING",
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } },
          },
        },
        include: { masjid: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.masjidProperty.findMany({
        where: {
          verificationStatus: "PENDING",
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } },
          },
        },
        include: { masjid: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.masjidDocument.findMany({
        where: {
          status: "PENDING",
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } },
          },
        },
        include: { masjid: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      masjidAdditionRequests,
      masjidAdminApplications,
      pendingMasjids,
      pendingUsers,
      pendingDonations,
      pendingAnnouncements,
      pendingEvents,
      pendingProperties,
      pendingDocuments,
    });
  } catch (err) {
    console.error("Error fetching verifications:", err);
    return NextResponse.json({ error: "Failed to fetch verifications data." }, { status: 500 });
  }
}
