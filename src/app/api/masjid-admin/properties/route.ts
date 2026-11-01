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

    if (!masjidId) return NextResponse.json({ properties: [] });

    const properties = await prisma.masjidProperty.findMany({
      where: { masjidId },
      include: { tenants: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch properties." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { propertyCustomId, contactPhone, location, documentUrl, monthlyRent, tenantName, tenantCustomId, tenantDocUrl } = body;

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

    const rent = Number(monthlyRent) || 0;

    const property = await prisma.masjidProperty.create({
      data: {
        masjidId,
        propertyCustomId: propertyCustomId || `PROP-${Math.floor(1000 + Math.random() * 9000)}`,
        contactPhone,
        location,
        documentUrl: documentUrl || "https://pdfobject.com/pdf/sample.pdf",
        monthlyRent: rent,
        revenueTotal: rent * 12,
        status: tenantName ? "OCCUPIED" : "VACANT",
        ...(tenantName
          ? {
              tenants: {
                create: [
                  {
                    tenantCustomId: tenantCustomId || `TNT-${Math.floor(1000 + Math.random() * 9000)}`,
                    tenantName,
                    contactPhone,
                    tenantDocUrl: tenantDocUrl || "https://pdfobject.com/pdf/sample.pdf",
                    monthlyRent: rent,
                  },
                ],
              },
            }
          : {}),
      },
      include: { tenants: true },
    });

    return NextResponse.json({ success: true, property });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create property." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { tenantId, tenantCustomId, tenantName, contactPhone } = body;

    if (!tenantId) return NextResponse.json({ error: "Tenant ID required." }, { status: 400 });

    const updatedTenant = await prisma.masjidTenant.update({
      where: { id: tenantId },
      data: {
        ...(tenantCustomId ? { tenantCustomId } : {}),
        ...(tenantName ? { tenantName } : {}),
        ...(contactPhone ? { contactPhone } : {}),
      },
    });

    return NextResponse.json({ success: true, tenant: updatedTenant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update tenant details." }, { status: 500 });
  }
}
