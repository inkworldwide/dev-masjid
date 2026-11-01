import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedMasjidsCount = await prisma.savedMasjid.count({
      where: { userId: user.id },
    });

    const donationsCount = await prisma.donationRecord.count({
      where: { donorId: user.id },
    });

    return NextResponse.json({
      analytics: {
        savedMasjidsCount,
        donationsCount,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
