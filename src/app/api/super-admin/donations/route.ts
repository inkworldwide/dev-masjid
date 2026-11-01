import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    
    // Basic validation
    if (!body.title || !body.purpose || !body.goalAmount || !body.masjidId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newCampaign = await prisma.donationCampaign.create({
      data: {
        title: body.title,
        purpose: body.purpose,
        category: body.category || "GENERAL_FUND",
        goalAmount: Number(body.goalAmount),
        masjidId: body.masjidId,
        status: "ACTIVE"
      },
      include: {
        masjid: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: newCampaign });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
