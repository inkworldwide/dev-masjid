import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "MASJID_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { masjidId: requestedMasjidId, title, category, goalAmount, description, coverImage, images } = body;

    if (!title || !goalAmount) {
      return NextResponse.json({ error: "Title and Goal Amount are required." }, { status: 400 });
    }

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      masjidId = requestedMasjidId;
      if (!masjidId) {
        const first = await prisma.masjid.findFirst();
        masjidId = first?.id || null;
      }
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) {
      return NextResponse.json({ error: "No assigned Masjid found." }, { status: 404 });
    }

    const campaign = await prisma.donationCampaign.create({
      data: {
        masjidId,
        title,
        category: category || "GENERAL_FUND",
        goalAmount: Number(goalAmount),
        raisedAmount: 0,
        status: "ACTIVE",
        purpose: description || title,
        coverImage: coverImage || null,
        images: images || [],
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "MASJID_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Campaign ID required." }, { status: 400 });

    await prisma.donationCampaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete campaign." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "MASJID_ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const requestedMasjidId = searchParams.get("masjidId");

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      if (requestedMasjidId && requestedMasjidId !== "ALL") {
        masjidId = requestedMasjidId;
      } else if (!requestedMasjidId) {
        const first = await prisma.masjid.findFirst();
        masjidId = first?.id || null;
      }
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    const whereClause: any = {};
    if (masjidId) {
      whereClause.masjidId = masjidId;
    }

    const campaigns = await prisma.donationCampaign.findMany({
      where: whereClause,
      include: { 
        masjid: true,
        _count: { select: { donations: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch campaigns." }, { status: 500 });
  }
}
