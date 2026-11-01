import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const masjidRequestSchema = z.object({
  masjidName: z.string().min(2, "Masjid name must be at least 2 characters"),
  location: z.string().min(2, "Location/address is required"),
  city: z.string().min(2, "City is required"),
  contactName: z.string().min(2, "Contact person name is required"),
  contactPhone: z.string().min(5, "Contact person phone is required"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
});

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(`masjid_request_${ip}`, 10, 60000);
    if (!limitCheck.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before submitting again." },
        { status: 429, headers: limitCheck.headers }
      );
    }

    const body = await req.json();
    const parsed = masjidRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { masjidName, location, city, contactName, contactPhone, contactEmail, additionalInfo } = parsed.data;

    const trimmedName = masjidName.trim();
    const trimmedCity = city.trim();
    const trimmedLocation = location.trim();
    const cleanPhone = contactPhone.replace(/\D/g, "");
    const normName = normalize(trimmedName);
    const normCity = normalize(trimmedCity);
    const normLocation = normalize(trimmedLocation);

    // 1. Check if this Masjid ALREADY EXISTS in the verified Masjid directory
    const existingMasjids = await prisma.masjid.findMany({
      include: { city: true },
    });

    const alreadyVerified = existingMasjids.find((m) => {
      const mNormName = normalize(m.name);
      const mNormCity = m.city ? normalize(m.city.name) : "";
      const mNormLoc = normalize(m.address || m.location || "");

      const isSameCity = mNormCity === normCity;
      const isSameName = mNormName === normName;
      const isSameLocation = normLocation.length > 5 && mNormLoc === normLocation;

      return isSameCity && (isSameName || isSameLocation);
    });

    if (alreadyVerified) {
      return NextResponse.json(
        {
          error: `"${alreadyVerified.name}" is already registered and verified in ${trimmedCity}. You can select it directly from the Masjid dropdown.`,
          existingMasjidId: alreadyVerified.id,
        },
        { status: 409 }
      );
    }

    // 2. Check if a duplicate request is ALREADY PENDING or APPROVED in MasjidAdditionRequest
    const existingRequests = await prisma.masjidAdditionRequest.findMany({
      where: {
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    const duplicateReq = existingRequests.find((r) => {
      const rNormName = normalize(r.masjidName);
      const rNormCity = normalize(r.city);
      const rNormLoc = normalize(r.location);
      const rPhone = r.contactPhone.replace(/\D/g, "");

      const isSameCity = rNormCity === normCity;
      const isSameName = rNormName === normName;
      const isSameLocation = normLocation.length > 5 && rNormLoc === normLocation;
      const isSamePhone = cleanPhone.length >= 8 && rPhone === cleanPhone;

      return isSameCity && (isSameName || isSameLocation || isSamePhone);
    });

    if (duplicateReq) {
      const statusText = duplicateReq.status === "PENDING" ? "pending review" : "already approved";
      return NextResponse.json(
        {
          error: `A request for "${duplicateReq.masjidName}" in ${trimmedCity} has already been submitted and is ${statusText}.`,
          referenceId: duplicateReq.customId,
        },
        { status: 409 }
      );
    }

    // 3. Check if an administrative application is already pending or approved in MasjidAdminApplication
    const existingAdminApps = await prisma.masjidAdminApplication.findMany({
      where: {
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    const duplicateAdminApp = existingAdminApps.find((a) => {
      const aNormName = normalize(a.masjidName);
      const aNormCity = normalize(a.city);
      const aPhone = a.contactPhone ? a.contactPhone.replace(/\D/g, "") : a.applicantPhone.replace(/\D/g, "");

      const isSameCity = aNormCity === normCity;
      const isSameName = aNormName === normName;
      const isSamePhone = cleanPhone.length >= 8 && aPhone === cleanPhone;

      return isSameCity && (isSameName || isSamePhone);
    });

    if (duplicateAdminApp) {
      return NextResponse.json(
        {
          error: `An application for "${duplicateAdminApp.masjidName}" in ${trimmedCity} is already on file with the Super Admin (Reference: ${duplicateAdminApp.customId}).`,
          referenceId: duplicateAdminApp.customId,
        },
        { status: 409 }
      );
    }

    // All duplicate checks passed -> Create the new unique request
    const customId = `MRQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRequest = await prisma.masjidAdditionRequest.create({
      data: {
        customId,
        masjidName: trimmedName,
        location: trimmedLocation,
        city: trimmedCity,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail ? contactEmail.trim().toLowerCase() : null,
        additionalInfo: additionalInfo?.trim() || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Masjid addition request submitted successfully.",
        referenceId: newRequest.customId,
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create masjid request error:", error);
    return NextResponse.json(
      { error: "Failed to submit masjid request." },
      { status: 500 }
    );
  }
}
