import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const [totalMasjids, totalAdmins, totalUsers] = await Promise.all([
      prisma.masjid.count(),
      prisma.user.count({ where: { role: "MASJID_ADMIN" } }),
      prisma.user.count({ where: { role: "USER" } }),
    ]);

    return NextResponse.json({
      metrics: {
        totalMasjids,
        totalAdmins,
        totalUsers,
      },
    });
  } catch (error: any) {
    console.error("Fetch admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analytics metrics" },
      { status: 500 }
    );
  }
}
