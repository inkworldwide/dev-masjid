import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized Super Admin access." }, { status: 403 });
    }

    const { entityType, entityId, action } = await req.json();

    if (!entityType || !entityId || !action) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const newStatus = action === "APPROVE" ? "VERIFIED" : "REJECTED";
    // For donations, active status is "ACTIVE"
    const activeStatus = action === "APPROVE" ? "ACTIVE" : "REJECTED";

    switch (entityType) {
      case "DONATION":
        await prisma.donationCampaign.update({
          where: { id: entityId },
          data: { status: activeStatus }
        });
        break;
      case "ANNOUNCEMENT":
        await prisma.masjidAnnouncement.update({
          where: { id: entityId },
          data: { verificationStatus: newStatus }
        });
        break;
      case "EVENT":
        await prisma.masjidEvent.update({
          where: { id: entityId },
          data: { verificationStatus: newStatus }
        });
        break;
      case "PROPERTY":
        await prisma.masjidProperty.update({
          where: { id: entityId },
          data: { verificationStatus: newStatus }
        });
        break;
      case "DOCUMENT":
        await prisma.masjidDocument.update({
          where: { id: entityId },
          data: { status: newStatus as any }
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid entity type." }, { status: 400 });
    }

    return NextResponse.json({ message: `${entityType} successfully updated.` });
  } catch (err) {
    console.error(`Error updating content:`, err);
    return NextResponse.json({ error: "Failed to update content status." }, { status: 500 });
  }
}
