import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Access denied. Administrative role required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isDeletedQuery = searchParams.get("deleted") === "true";
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const filterMasjidId = searchParams.get("masjidId")?.trim() || "";
    const filterRole = searchParams.get("role")?.trim() || "";

    const where: any = {
      isDeleted: isDeletedQuery,
    };

    // Masjid-specific visibility enforcement on backend
    if (user.role === "MASJID_ADMIN") {
      const perm = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      if (!perm?.masjidId) {
        return NextResponse.json({ users: [] });
      }
      where.masjidId = perm.masjidId;
      where.role = "USER"; // Masjid Admins can only view community users for their assigned Masjid
    } else if (user.role === "SUPER_ADMIN") {
      if (filterMasjidId) {
        where.masjidId = filterMasjidId;
      }
      if (filterRole) {
        where.role = filterRole;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { customId: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        customId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isApproved: true,
        isSuspended: true,
        isDeleted: true,
        deletedAt: true,
        deletedBy: true,
        masjidId: true,
        createdAt: true,
        updatedAt: true,
        masjid: {
          select: {
            id: true,
            name: true,
            location: true,
            city: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: isDeletedQuery ? { deletedAt: "desc" } : { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Fetch users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") || searchParams.get("id");
    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin accounts cannot be deleted." }, { status: 403 });
    }

    // Masjid Admin scope validation
    if (user.role === "MASJID_ADMIN") {
      const perm = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      if (!perm?.masjidId || targetUser.masjidId !== perm.masjidId || targetUser.role !== "USER") {
        return NextResponse.json(
          { error: "Unauthorized. You can only manage community users of your assigned Masjid." },
          { status: 403 }
        );
      }
    }

    // Soft Delete
    const deletedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User moved to Deleted Users List.",
      user: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email,
        deletedAt: deletedUser.deletedAt,
      },
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
