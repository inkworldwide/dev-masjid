import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      const firstMasjid = await prisma.masjid.findFirst();
      masjidId = firstMasjid?.id || null;
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) return NextResponse.json({ staff: [] });

    const staff = await prisma.masjidStaff.findMany({
      where: { masjidId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staff });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch staff." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, role, contact, salary } = body;

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      const firstMasjid = await prisma.masjid.findFirst();
      masjidId = firstMasjid?.id || null;
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) return NextResponse.json({ error: "No assigned Masjid found." }, { status: 400 });

    const staffMember = await prisma.masjidStaff.create({
      data: {
        masjidId,
        name,
        role: role || "WORKER",
        contact: contact || "+91 98765 00000",
        salary: salary ? Number(salary) : 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, staffMember });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add staff member." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Staff ID required." }, { status: 400 });

    await prisma.masjidStaff.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete staff member." }, { status: 500 });
  }
}
