import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const masjids = await prisma.masjid.findMany({
      where: {
        status: "VERIFIED",
      },
      select: {
        id: true,
        name: true,
        location: true,
        address: true,
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ masjids });
  } catch (error) {
    console.error("Fetch available masjids error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available masjids." },
      { status: 500 }
    );
  }
}
