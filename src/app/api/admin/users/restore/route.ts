import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Masjid Admin scope validation
    if (user.role === "MASJID_ADMIN") {
      const perm = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      if (!perm?.masjidId || targetUser.masjidId !== perm.masjidId || targetUser.role !== "USER") {
        return NextResponse.json(
          { error: "Unauthorized. You can only restore community users of your assigned Masjid." },
          { status: 403 }
        );
      }
    }

    const restoredUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User successfully restored to active Users List.",
      user: {
        id: restoredUser.id,
        name: restoredUser.name,
        email: restoredUser.email,
        isDeleted: restoredUser.isDeleted,
      },
    });
  } catch (err) {
    console.error("Restore user error:", err);
    return NextResponse.json({ error: "Failed to restore user." }, { status: 500 });
  }
}
