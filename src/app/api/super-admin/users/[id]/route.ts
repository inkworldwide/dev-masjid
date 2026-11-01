import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the user's admin permissions to see if any masjids become orphaned
    const permissions = await prisma.masjidAdminPermission.findMany({
      where: { userId: id },
    });

    const masjidIdsToCheck = permissions.map(p => p.masjidId);

    // Delete the user from the database
    await prisma.user.delete({
      where: { id }
    });

    // If the deleted user was the sole admin of a masjid, cleanly delete that orphan masjid
    for (const mId of masjidIdsToCheck) {
      const remainingAdmins = await prisma.masjidAdminPermission.count({
        where: { masjidId: mId },
      });
      if (remainingAdmins === 0) {
        await prisma.masjidProperty.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidAnnouncement.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidEvent.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidDocument.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidStaff.deleteMany({ where: { masjidId: mId } });
        await prisma.donationCampaign.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidDonation.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidExpenditure.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidOpeningBalance.deleteMany({ where: { masjidId: mId } });
        await prisma.masjidFinancialYear.deleteMany({ where: { masjidId: mId } });
        await prisma.masjid.delete({ where: { id: mId } }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { 
        passwordHash: hashedPassword,
        plainPassword: password 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
