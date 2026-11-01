import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { DEFAULT_ENABLED_MODULES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized Super Admin access." }, { status: 403 });
    }

    const { masjidId, status } = await req.json();

    if (!masjidId || !status) {
      return NextResponse.json({ error: "Missing masjidId or status." }, { status: 400 });
    }

    let finalStatus = status;

    if (status === "VERIFIED") {
      const targetMasjid = await prisma.masjid.findUnique({
        where: { id: masjidId },
        select: { name: true, address: true }
      });

      if (targetMasjid) {
        const existingVerified = await prisma.masjid.findFirst({
          where: {
            name: targetMasjid.name,
            address: targetMasjid.address,
            status: "VERIFIED",
            id: { not: masjidId }
          }
        });

        if (existingVerified) {
          finalStatus = "REJECTED"; // Reject the duplicate
        }
      }
    }

    const updateData: any = { status: finalStatus };
    if (finalStatus === "VERIFIED") {
      const current = await prisma.masjid.findUnique({
        where: { id: masjidId },
        select: { enabledModules: true }
      });
      if (!current?.enabledModules || (Array.isArray(current.enabledModules) && (current.enabledModules as string[]).length === 0)) {
        updateData.enabledModules = DEFAULT_ENABLED_MODULES;
      }
    }

    const updatedMasjid = await prisma.masjid.update({
      where: { id: masjidId },
      data: updateData,
    });

    // If the masjid is being VERIFIED, automatically approve its admins so they can log in
    if (status === "VERIFIED") {
      const adminPermissions = await prisma.masjidAdminPermission.findMany({
        where: { masjidId },
        select: { userId: true }
      });
      
      const adminIds = adminPermissions.map(p => p.userId);
      
      if (adminIds.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: adminIds } },
          data: { isApproved: true }
        });
      }
    }

    if (finalStatus === "REJECTED" && status === "VERIFIED") {
      return NextResponse.json({ message: "Duplicate masjid found. Request automatically rejected.", masjid: updatedMasjid, autoRejected: true });
    }

    return NextResponse.json({ message: "Masjid approved successfully", masjid: updatedMasjid });
  } catch (err) {
    console.error("Error approving masjid:", err);
    return NextResponse.json({ error: "Failed to approve masjid" }, { status: 500 });
  }
}
