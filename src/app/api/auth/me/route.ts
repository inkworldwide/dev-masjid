import { NextResponse } from "next/server";
import { getAuthenticatedUser, hashPassword, getAdminMasjidScope } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_ENABLED_MODULES } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      const response = NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
      
      // Clear invalid/stale auth_token cookie
      const isProduction = process.env.NODE_ENV === "production";
      const secureFlag = isProduction ? "; Secure" : "";
      response.headers.set(
        "Set-Cookie",
        `auth_token=; HttpOnly; SameSite=Lax; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`
      );
      
      return response;
    }

    let masjidScope = null;
    let masjidName = null;
    let enabledModules: string[] = [];

    const scopeId = await getAdminMasjidScope();
    if (scopeId) {
      masjidScope = scopeId;
      const masjid = await prisma.masjid.findUnique({
        where: { id: scopeId },
        select: { name: true, enabledModules: true }
      });
      if (masjid) {
        masjidName = masjid.name;
        if (masjid.enabledModules && Array.isArray(masjid.enabledModules) && (masjid.enabledModules as string[]).length > 0) {
          enabledModules = masjid.enabledModules as string[];
          if (!enabledModules.includes("view_dashboard")) {
            enabledModules = ["view_dashboard", ...enabledModules];
          }
        } else {
          enabledModules = DEFAULT_ENABLED_MODULES;
        }
      }
    }

    return NextResponse.json({
      user: {
        ...user,
        masjidScope: masjidScope || user.masjidId || null,
        masjidName: masjidName || (user as any).masjid?.name || null,
        enabledModules,
      },
    });
  } catch (error: any) {
    console.error("Auth Me API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred retrieving session" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, password, avatar } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    
    if (password) {
      updateData.passwordHash = await hashPassword(password);
      updateData.plainPassword = password;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
