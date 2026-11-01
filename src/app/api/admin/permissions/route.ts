import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized Super Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      masjidId,
      canAccessMainPage,
      canAccessDocuments,
      canAccessDonations,
      canAccessRolesPermissions,
      canAccessProperties,
      canAccessTenants,
      canAccessMembers,
      canAccessStaff,
      canAccessEvents,
      canAccessAnnouncements,
    } = body;

    if (!name || !email || !masjidId) {
      return NextResponse.json({ error: "Admin Name, Email, and Assigned Masjid are required." }, { status: 400 });
    }

    const masjid = await prisma.masjid.findUnique({
      where: { id: masjidId },
      include: { city: true }
    });
    
    const prefix = masjid?.city?.name ? masjid.city.name.substring(0, 3).toUpperCase() : "ADM";

    const passwordHash = await bcrypt.hash("admin123", 10);

    // Upsert User as MASJID_ADMIN
    const adminUser = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
        role: "MASJID_ADMIN",
      },
      create: {
        customId: `${prefix}${Math.floor(1000 + Math.random() * 9000)}`,
        email,
        name,
        phone,
        passwordHash,
        plainPassword: "admin123",
        role: "MASJID_ADMIN",
        isEmailVerified: true,
        isApproved: true,
      },
    });

    // Update / Create Granular Permission flags
    const permission = await prisma.masjidAdminPermission.upsert({
      where: {
        userId_masjidId: {
          userId: adminUser.id,
          masjidId,
        },
      },
      update: {
        canAccessMainPage: canAccessMainPage ?? true,
        canAccessDocuments: canAccessDocuments ?? true,
        canAccessDonations: canAccessDonations ?? true,
        canAccessRolesPermissions: canAccessRolesPermissions ?? true,
        canAccessProperties: canAccessProperties ?? true,
        canAccessTenants: canAccessTenants ?? true,
        canAccessMembers: canAccessMembers ?? true,
        canAccessStaff: canAccessStaff ?? true,
        canAccessEvents: canAccessEvents ?? true,
        canAccessAnnouncements: canAccessAnnouncements ?? true,
      },
      create: {
        userId: adminUser.id,
        masjidId,
        canAccessMainPage: canAccessMainPage ?? true,
        canAccessDocuments: canAccessDocuments ?? true,
        canAccessDonations: canAccessDonations ?? true,
        canAccessRolesPermissions: canAccessRolesPermissions ?? true,
        canAccessProperties: canAccessProperties ?? true,
        canAccessTenants: canAccessTenants ?? true,
        canAccessMembers: canAccessMembers ?? true,
        canAccessStaff: canAccessStaff ?? true,
        canAccessEvents: canAccessEvents ?? true,
        canAccessAnnouncements: canAccessAnnouncements ?? true,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ADMIN_ASSIGNED",
        entity: "MasjidAdminPermission",
        details: `Assigned admin ${adminUser.name} (${adminUser.email}) to Masjid ID ${masjidId} with updated permissions.`,
      },
    });

    return NextResponse.json({ success: true, adminUser, permission });
  } catch (err: any) {
    console.error("Admin permission API error:", err);
    return NextResponse.json({ error: "Failed to update admin permissions." }, { status: 500 });
  }
}
