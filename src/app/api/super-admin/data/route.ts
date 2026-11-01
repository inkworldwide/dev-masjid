import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized Super Admin access." }, { status: 403 });
    }

    const [admins, masjids, users, totalStaff, totalImams, donationsAggregate, donations] = await Promise.all([
      prisma.user.findMany({
        where: { role: "MASJID_ADMIN", isApproved: true, isSuspended: false },
        include: {
          adminPermissions: {
            include: { masjid: true },
          },
        },
      }),
      prisma.masjid.findMany({
        where: {
          status: "VERIFIED",
          admins: {
            some: {
              user: {
                isApproved: true,
                isSuspended: false,
              },
            },
          },
        },
        select: { id: true, name: true, location: true, status: true, city: true, address: true, staff: true, admins: { include: { user: true } } },
      }),
      prisma.user.findMany({
        where: { role: "USER" },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.masjidStaff.count({
        where: {
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } }
          }
        }
      }),
      prisma.masjidStaff.count({
        where: {
          role: "IMAM",
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } }
          }
        }
      }),
      prisma.donationCampaign.aggregate({ _sum: { raisedAmount: true } }),
      prisma.donationCampaign.findMany({
        where: {
          masjid: {
            status: "VERIFIED",
            admins: { some: { user: { isApproved: true, isSuspended: false } } }
          }
        },
        include: {
          masjid: { select: { name: true, city: true } },
          donations: { select: { id: true, amount: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
    ]);

    return NextResponse.json({ 
      admins, 
      masjids, 
      users,
      totalStaff,
      totalImams,
      totalDonationsAmount: Number(donationsAggregate._sum.raisedAmount || 0),
      donations
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch Super Admin data." }, { status: 500 });
  }
}
