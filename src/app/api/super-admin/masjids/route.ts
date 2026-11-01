import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, hashPassword } from "@/lib/auth";
import { ensureFinancialDataForMasjid } from "@/lib/finance-seed";
import { DEFAULT_ENABLED_MODULES } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const masjids = await prisma.masjid.findMany({
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
      select: {
        id: true,
        name: true,
        location: true,
        address: true,
        status: true,
        registrationNo: true,
        city: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, masjids });
  } catch (err) {
    console.error("Fetch Masjids error:", err);
    return NextResponse.json({ error: "Failed to fetch masjids." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { 
      name, 
      masjidName,
      cityName, 
      address, 
      registrationNo, 
      plotSize, 
      description, 
      contactNumber,
      adminName,
      adminEmail,
      adminPhone,
      adminPassword,
    } = body;

    const finalMasjidName = (name || masjidName || "").trim();
    if (!finalMasjidName || !cityName) {
      return NextResponse.json({ error: "Masjid Name and City are required." }, { status: 400 });
    }

    if (!adminName || !adminEmail) {
      return NextResponse.json({ error: "Administrator Name and Email are required." }, { status: 400 });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An administrator or user with this email address already exists." },
        { status: 409 }
      );
    }

    const cleanCityName = cityName.trim();
    const citySlug = cleanCityName.toLowerCase().replace(/\s+/g, "-");

    // Resolve City ID or create new City with required slug
    let city = await prisma.city.findFirst({
      where: { name: { equals: cleanCityName, mode: "insensitive" } },
    });

    if (!city) {
      city = await prisma.city.create({
        data: {
          name: cleanCityName,
          slug: `${citySlug}-${Math.floor(100 + Math.random() * 900)}`,
        },
      });
    }

    const cityCode = cleanCityName.substring(0, 3).toUpperCase();
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const masjidSlug = finalMasjidName.toLowerCase().replace(/\s+/g, "-") + "-" + randomDigits;

    // Create the Admin User
    const finalPassword = adminPassword || "Admin@123";
    const passwordHash = await hashPassword(finalPassword);
    const customId = `${cityCode}${Math.floor(10000 + Math.random() * 90000)}`;

    const newAdmin = await prisma.user.create({
      data: {
        name: adminName.trim(),
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        plainPassword: finalPassword,
        phone: adminPhone || contactNumber || null,
        role: "MASJID_ADMIN",
        customId,
        isEmailVerified: true,
        isApproved: true, // Super Admin direct addition is immediately verified
        isSuspended: false,
      },
    });

    // Create the Masjid
    const newMasjid = await prisma.masjid.create({
      data: {
        name: finalMasjidName,
        slug: masjidSlug,
        cityId: city.id,
        location: address || `${cleanCityName}, India`,
        address: address || `${cleanCityName}, India`,
        registrationNo: registrationNo || `WAQF-${cityCode}-${new Date().getFullYear()}-${randomDigits}`,
        plotSize: plotSize || "12,000 Sq Yards",
        description: description || `Historic congregational Masjid located in ${cleanCityName}.`,
        contactNumber: contactNumber || adminPhone || "+91 98765 44321",
        coverImage: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1000&auto=format&fit=crop",
        pictures: ["https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1000&auto=format&fit=crop"],
        state: "India",
        pincode: "110006",
        status: "VERIFIED",
        enabledModules: DEFAULT_ENABLED_MODULES,
      },
    });

    // Assign full Admin Permissions to the new Masjid
    await prisma.masjidAdminPermission.create({
      data: {
        userId: newAdmin.id,
        masjidId: newMasjid.id,
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

    // Initialize Financial Data for the new Masjid
    await ensureFinancialDataForMasjid(newMasjid.id);

    return NextResponse.json({ 
      success: true, 
      masjid: newMasjid, 
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        customId: newAdmin.customId,
      } 
    });
  } catch (err) {
    console.error("Create Masjid & Admin error:", err);
    return NextResponse.json({ error: "Failed to create new Masjid and Administrator." }, { status: 500 });
  }
}
