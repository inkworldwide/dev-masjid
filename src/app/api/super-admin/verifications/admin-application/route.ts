import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { DEFAULT_ENABLED_MODULES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, action, rejectionReason } = body;

    if (!applicationId || !action) {
      return NextResponse.json({ error: "Application ID and action are required." }, { status: 400 });
    }

    const application = await prisma.masjidAdminApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: "Masjid admin application not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      // 1. Mark application as APPROVED
      await prisma.masjidAdminApplication.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED",
          reviewedBy: user.id,
          rejectionReason: null,
        },
      });

      // 2. Approve applicant user
      if (application.userId) {
        await prisma.user.update({
          where: { id: application.userId },
          data: {
            isApproved: true,
            isSuspended: false,
          },
        });
      }

      // 3. Verify the associated Masjid
      let masjidId = application.existingMasjidId;
      if (!masjidId && application.userId) {
        const perm = await prisma.masjidAdminPermission.findFirst({
          where: { userId: application.userId },
        });
        if (perm) masjidId = perm.masjidId;
      }

      if (masjidId) {
        const currentMasjid = await prisma.masjid.findUnique({
          where: { id: masjidId },
          select: { enabledModules: true },
        });

        const updateData: any = { status: "VERIFIED" };
        if (!currentMasjid?.enabledModules || (Array.isArray(currentMasjid.enabledModules) && (currentMasjid.enabledModules as string[]).length === 0)) {
          updateData.enabledModules = DEFAULT_ENABLED_MODULES;
        }

        await prisma.masjid.update({
          where: { id: masjidId },
          data: updateData,
        });

        // Ensure permission exists
        if (application.userId) {
          const perm = await prisma.masjidAdminPermission.findFirst({
            where: { userId: application.userId, masjidId },
          });

          if (!perm) {
            await prisma.masjidAdminPermission.create({
              data: {
                userId: application.userId,
                masjidId,
                canAccessMainPage: true,
                canAccessDocuments: true,
                canAccessDonations: true,
                canAccessRolesPermissions: true,
                canAccessProperties: true,
                canAccessTenants: true,
                canAccessMembers: true,
                canAccessStaff: true,
                canAccessEvents: true,
                canAccessAnnouncements: true,
              },
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Masjid Admin Application approved successfully.",
      });
    } else if (action === "REJECT") {
      await prisma.masjidAdminApplication.update({
        where: { id: applicationId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Application rejected by Super Admin.",
          reviewedBy: user.id,
        },
      });

      if (application.existingMasjidId) {
        await prisma.masjid.update({
          where: { id: application.existingMasjidId },
          data: { status: "REJECTED" },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: "Masjid Admin Application marked as rejected.",
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT." }, { status: 400 });
    }
  } catch (err) {
    console.error("Error processing admin application:", err);
    return NextResponse.json({ error: "Failed to process application." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Application ID is required." }, { status: 400 });
    }

    const app = await prisma.masjidAdminApplication.findUnique({
      where: { id },
    });

    if (app) {
      // If the application has an associated pending masjid that was created solely for it, clean it up
      if (app.existingMasjidId) {
        const targetMasjid = await prisma.masjid.findUnique({
          where: { id: app.existingMasjidId },
          select: { status: true },
        });
        if (targetMasjid && targetMasjid.status === "PENDING") {
          await prisma.masjidAdminPermission.deleteMany({
            where: { masjidId: app.existingMasjidId },
          });
          await prisma.masjid.delete({
            where: { id: app.existingMasjidId },
          }).catch(() => {});
        }
      }

      await prisma.masjidAdminApplication.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true, message: "Masjid Admin Application deleted successfully." });
  } catch (err) {
    console.error("Error deleting admin application:", err);
    return NextResponse.json({ error: "Failed to delete application." }, { status: 500 });
  }
}
