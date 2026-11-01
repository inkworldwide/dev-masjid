import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedMasjidId = searchParams.get("masjidId");
    const fundType = searchParams.get("fundType");
    const paymentMethod = searchParams.get("paymentMethod");
    const search = searchParams.get("search") || "";

    let targetMasjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      if (requestedMasjidId && requestedMasjidId !== "ALL") {
        targetMasjidId = requestedMasjidId;
      }
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      targetMasjidId = permission?.masjidId || null;
    }

    const where: any = {};
    if (targetMasjidId) where.masjidId = targetMasjidId;
    if (fundType && fundType !== "ALL") where.fundType = fundType;
    if (paymentMethod && paymentMethod !== "ALL") where.paymentMethod = paymentMethod;

    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: "insensitive" } },
        { receiptNumber: { contains: search, mode: "insensitive" } },
        { donorPhone: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const donations = await prisma.masjidDonation.findMany({
      where,
      include: { masjid: { select: { id: true, name: true, location: true } } },
      orderBy: { donationDate: "desc" },
    });

    const donationsWithParsedType = donations.map((d) => {
      const match = d.description?.match(/\[Donation Type:\s*([^\]]+)\]/i);
      const donationType = match
        ? match[1].trim()
        : (d.fundType === "ZAKAT" ? "Zakat" : d.fundType === "SADAQAH" ? "Sadaqah" : "General Masjid Fund");
      return {
        ...d,
        donationType,
      };
    });

    return NextResponse.json({ success: true, donations: donationsWithParsedType });
  } catch (error) {
    console.error("Failed to fetch donations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      masjidId,
      donationDate,
      amount,
      fundType,
      paymentMethod,
      donorName,
      donorPhone,
      donorEmail,
      donorAddress,
      donationType,
      description,
      chequeNumber,
      bankName,
      chequeDate,
      ddNumber,
      upiTransactionId,
      utrNumber,
      customReceiptNumber,
    } = body;

    let targetMasjidId: string | null = masjidId;
    if (user.role === "MASJID_ADMIN") {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      targetMasjidId = permission?.masjidId || null;
    }

    if (!targetMasjidId) {
      return NextResponse.json({ error: "Masjid is required" }, { status: 400 });
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const masjid = await prisma.masjid.findUnique({ where: { id: targetMasjidId } });
    if (!masjid) return NextResponse.json({ error: "Masjid not found" }, { status: 404 });

    // Find or create active financial year
    let fy = await prisma.masjidFinancialYear.findFirst({
      where: { masjidId: targetMasjidId, isClosed: false },
    });

    if (!fy) {
      fy = await prisma.masjidFinancialYear.create({
        data: {
          masjidId: targetMasjidId,
          yearName: "2026-2027",
          startDate: new Date("2026-04-01"),
          endDate: new Date("2027-03-31"),
        },
      });
    }

    // Generate unique sequential receipt number
    const count = await prisma.masjidDonation.count({ where: { masjidId: targetMasjidId } });
    const prefix = masjid.name.substring(0, 3).toUpperCase();
    const receiptNumber = customReceiptNumber || `REC-${prefix}-2026-${String(count + 1).padStart(4, "0")}`;

    const donation = await prisma.masjidDonation.create({
      data: {
        masjidId: targetMasjidId,
        financialYearId: fy.id,
        donationDate: donationDate ? new Date(donationDate) : new Date(),
        amount: Number(amount),
        fundType: fundType || "GENERAL_FUND",
        paymentMethod: paymentMethod || "CASH",
        receiptNumber,
        donorName: donorName || "Anonymous Donor",
        donorPhone: donorPhone || null,
        donorEmail: donorEmail || null,
        donorAddress: donorAddress || null,
        description: donationType ? `[Donation Type: ${donationType}] ${description || ""}`.trim() : (description || "Mosque donation"),
        chequeNumber: chequeNumber || null,
        bankName: bankName || null,
        chequeDate: chequeDate ? new Date(chequeDate) : null,
        ddNumber: ddNumber || null,
        upiTransactionId: upiTransactionId || null,
        utrNumber: utrNumber || null,
        status: "VERIFIED",
        createdBy: user.name,
      },
    });

    await prisma.financialAuditLog.create({
      data: {
        masjidId: targetMasjidId,
        userId: user.id,
        action: "CREATE_DONATION",
        entityType: "DONATION",
        entityId: donation.id,
        newValues: {
          amount: Number(amount),
          fundType,
          receiptNumber,
          donorName,
        },
      },
    });

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    console.error("Failed to create donation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
