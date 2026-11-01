import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized Super Admin access." }, { status: 403 });
    }

    const documents = await prisma.masjidDocument.findMany({
      include: {
        masjid: {
          select: { id: true, name: true, city: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = documents.length;
    const verified = documents.filter(d => d.status === "VERIFIED").length;
    const pending = documents.filter(d => d.status === "PENDING").length;
    const rejected = documents.filter(d => d.status === "REJECTED").length;

    return NextResponse.json({
      documents,
      stats: { total, verified, pending, rejected }
    });
  } catch (err) {
    console.error("Error fetching documents:", err);
    return NextResponse.json({ error: "Failed to fetch documents." }, { status: 500 });
  }
}
