import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, isApproved } = body;

    if (!userId || typeof isApproved !== "boolean") {
      return NextResponse.json({ error: "User ID and approval state are required." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Approve user error:", err);
    return NextResponse.json({ error: "Failed to update user approval status." }, { status: 500 });
  }
}
