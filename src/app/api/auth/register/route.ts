import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { DEFAULT_ENABLED_MODULES } from "@/lib/constants";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["USER", "MASJID_ADMIN"]).default("USER"),
  masjidId: z.string().optional(),
  // Masjid Admin fields
  masjidName: z.string().optional(),
  cityName: z.string().optional(),
  address: z.string().optional(),
  registrationNo: z.string().optional(),
  plotSize: z.string().optional(),
  masjidContact: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonEmail: z.string().optional(),
  description: z.string().optional(),
});

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`register_${ip}`, 10, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait a minute before trying again." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      phone,
      role,
      masjidId,
      masjidName,
      cityName,
      address,
      registrationNo,
      plotSize,
      masjidContact,
      contactPersonName,
      contactPersonEmail,
      description,
    } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Role-specific validations and duplicate prevention
    let existingTargetMasjidId: string | null = null;

    if (role === "USER") {
      if (masjidId) {
        const selectedMasjid = await prisma.masjid.findUnique({
          where: { id: masjidId },
        });

        if (!selectedMasjid || selectedMasjid.status !== "VERIFIED") {
          return NextResponse.json(
            { error: "Selected Masjid is invalid or not yet approved for public association." },
            { status: 400 }
          );
        }
      }
    } else if (role === "MASJID_ADMIN") {
      if (!masjidName || !cityName || !address) {
        return NextResponse.json(
          { error: "Masjid Name, City, and Address/Location are required for Masjid Admin application." },
          { status: 400 }
        );
      }

      const cleanMasjidName = masjidName.trim();
      const cleanCityName = cityName.trim();
      const cleanAddress = address.trim();
      const normName = normalize(cleanMasjidName);
      const normCity = normalize(cleanCityName);
      const normAddress = normalize(cleanAddress);
      const cleanPhone = (phone || "").replace(/\D/g, "");

      // 1. Check existing verified or pending Masjids in the database
      const existingMasjids = await prisma.masjid.findMany({
        include: {
          city: true,
          admins: {
            include: { user: true },
          },
        },
      });

      const matchedMasjid = existingMasjids.find((m) => {
        const mNormName = normalize(m.name);
        const mNormCity = m.city ? normalize(m.city.name) : "";
        const mNormAddress = normalize(m.address || m.location || "");

        const isSameCity = mNormCity === normCity;
        const isSameName = mNormName === normName;
        const isSameAddress = normAddress.length > 5 && mNormAddress === normAddress;

        return isSameCity && (isSameName || isSameAddress);
      });

      if (matchedMasjid) {
        if (matchedMasjid.status === "VERIFIED") {
          const activeAdmin = matchedMasjid.admins.find(
            (a) => a.user.isApproved && !a.user.isSuspended
          );
          if (activeAdmin) {
            return NextResponse.json(
              {
                error: `An administrator is already assigned to "${matchedMasjid.name}" in ${cleanCityName}. Multiple admin registrations for the same Masjid are not permitted.`,
              },
              { status: 409 }
            );
          }
          // Masjid exists but has no active admin -> link application to existing masjid
          existingTargetMasjidId = matchedMasjid.id;
        } else if (matchedMasjid.status === "PENDING") {
          return NextResponse.json(
            {
              error: `A registration application for "${matchedMasjid.name}" in ${cleanCityName} has already been submitted and is awaiting Super Admin verification.`,
            },
            { status: 409 }
          );
        }
      }

      // 2. Check existing MasjidAdminApplication records
      const existingApps = await prisma.masjidAdminApplication.findMany({
        where: {
          status: { in: ["PENDING", "APPROVED"] },
        },
      });

      const duplicateApp = existingApps.find((a) => {
        const aNormName = normalize(a.masjidName);
        const aNormCity = normalize(a.city);
        const aPhone = (a.applicantPhone || "").replace(/\D/g, "");

        const isSameCity = aNormCity === normCity;
        const isSameName = aNormName === normName;
        const isSamePhone = cleanPhone.length >= 8 && aPhone === cleanPhone;

        return isSameCity && (isSameName || isSamePhone);
      });

      if (duplicateApp) {
        const statusMsg = duplicateApp.status === "PENDING" ? "pending Super Admin review" : "already approved";
        return NextResponse.json(
          {
            error: `An administrative application for "${duplicateApp.masjidName}" in ${cleanCityName} is ${statusMsg} (Reference: ${duplicateApp.customId}). Duplicate submissions are blocked.`,
            referenceId: duplicateApp.customId,
          },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hashPassword(password);
    const prefix = cityName ? cityName.substring(0, 3).toUpperCase() : "USR";
    const customId = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;

    const isApproved = role === "USER";

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        plainPassword: password,
        phone: phone || null,
        role: role as any,
        customId,
        isEmailVerified: true,
        isApproved,
        masjidId: role === "USER" ? masjidId : null,
      },
    });

    let applicationReferenceId = "";
    if (role === "MASJID_ADMIN" && masjidName && cityName) {
      let targetMasjidId = existingTargetMasjidId;

      if (!targetMasjidId) {
        const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        let city = await prisma.city.findUnique({ where: { slug: citySlug } });
        if (!city) {
          city = await prisma.city.create({
            data: { name: cityName, slug: citySlug },
          });
        }

        const masjidSlug =
          masjidName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
          "-" +
          Date.now().toString().slice(-4);

        const newMasjid = await prisma.masjid.create({
          data: {
            name: masjidName.trim(),
            slug: masjidSlug,
            cityId: city.id,
            address: address || "",
            location: address || "",
            registrationNo: registrationNo || "",
            plotSize: plotSize || "",
            contactNumber: masjidContact || phone || "",
            description: description || "",
            status: "PENDING",
            coverImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80",
            pictures: [],
            facilities: [],
            pincode: "000000",
            enabledModules: DEFAULT_ENABLED_MODULES,
          },
        });
        targetMasjidId = newMasjid.id;
      }

      // Update user's masjidId
      await prisma.user.update({
        where: { id: user.id },
        data: { masjidId: targetMasjidId },
      });

      // Create MasjidAdminPermission (locked until approved)
      await prisma.masjidAdminPermission.create({
        data: {
          userId: user.id,
          masjidId: targetMasjidId,
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

      // Create separate MasjidAdminApplication record
      const appCustomId = `MAA-${Math.floor(100000 + Math.random() * 900000)}`;
      applicationReferenceId = appCustomId;

      await prisma.masjidAdminApplication.create({
        data: {
          customId: appCustomId,
          userId: user.id,
          applicantName: name,
          applicantEmail: email.toLowerCase(),
          applicantPhone: phone || "",
          masjidName: masjidName.trim(),
          location: (address || "").trim(),
          city: cityName.trim(),
          contactName: contactPersonName || name,
          contactPhone: masjidContact || phone || "",
          contactEmail: contactPersonEmail || email.toLowerCase(),
          additionalInfo: description || null,
          existingMasjidId: targetMasjidId,
          status: "PENDING",
        },
      });
    }

    if (role === "USER") {
      return NextResponse.json(
        {
          message: "Registration successful! You can now sign in to your community account.",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            masjidId: user.masjidId,
            isApproved: user.isApproved,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Masjid Admin application submitted successfully! Your application is pending Super Admin verification.",
        referenceId: applicationReferenceId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isApproved: user.isApproved,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
