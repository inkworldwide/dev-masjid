import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getAdminMasjidScope } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    const { campaignId, donorName, donorEmail, amount, donationType, notes } = body;

    const effectiveDonationType = (donationType && String(donationType).trim()) || "General Masjid Fund";

    if (!campaignId || !donorName || !donorEmail || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Campaign ID, donor name, valid email, and positive donation amount are required." },
        { status: 400 }
      );
    }

    let campaign = await prisma.donationCampaign.findUnique({
      where: { id: campaignId },
      include: { masjid: true },
    });

    if (!campaign) {
      // Resolve if campaignId is a masjidId or prefixed default
      const targetMasjidId = campaignId.startsWith("default-")
        ? campaignId.replace("default-", "")
        : campaignId;

      const targetMasjid = await prisma.masjid.findUnique({
        where: { id: targetMasjidId },
      });

      if (targetMasjid) {
        campaign = await prisma.donationCampaign.findFirst({
          where: { masjidId: targetMasjid.id },
          include: { masjid: true },
        });

        if (!campaign) {
          campaign = await prisma.donationCampaign.create({
            data: {
              masjidId: targetMasjid.id,
              title: `${targetMasjid.name} General Welfare & Maintenance Fund`,
              purpose: "General operational expenses, facility maintenance, and community welfare.",
              category: "GENERAL_FUND",
              goalAmount: 500000,
              raisedAmount: 0,
              status: "ACTIVE",
            },
            include: { masjid: true },
          });
        }
      }
    }

    if (!campaign) {
      return NextResponse.json({ error: "Donation campaign not found." }, { status: 404 });
    }

    // Resolve or create active financial year for the masjid
    let fy = await prisma.masjidFinancialYear.findFirst({
      where: { masjidId: campaign.masjidId, isClosed: false },
    });
    if (!fy) {
      fy = await prisma.masjidFinancialYear.create({
        data: {
          masjidId: campaign.masjidId,
          yearName: "2026-2027",
          startDate: new Date("2026-04-01"),
          endDate: new Date("2027-03-31"),
          isClosed: false,
        },
      });
    }

    let fundType: "GENERAL_FUND" | "ZAKAT" | "SADAQAH" | "GENERAL_CHARITY" | "INTEREST_FUND" | "OTHER_SOURCES" = "GENERAL_FUND";
    const dUpper = effectiveDonationType.toUpperCase();
    if (dUpper.includes("ZAKAT")) {
      fundType = "ZAKAT";
    } else if (dUpper.includes("SADAQAH")) {
      fundType = "SADAQAH";
    } else if (
      dUpper.includes("CHARITY") ||
      dUpper.includes("EDUCATION") ||
      dUpper.includes("WELFARE") ||
      dUpper.includes("EMERGENCY")
    ) {
      fundType = "GENERAL_CHARITY";
    } else if (dUpper.includes("INTEREST")) {
      fundType = "INTEREST_FUND";
    } else if (dUpper.includes("CONSTRUCTION") || dUpper.includes("MAINTENANCE") || dUpper.includes("GENERAL MASJID")) {
      fundType = "GENERAL_FUND";
    } else {
      const cat = String(campaign.category);
      if (cat === "ZAKAT") fundType = "ZAKAT";
      else if (cat === "SADAQAH") fundType = "SADAQAH";
      else if (cat === "INTEREST_FUND") fundType = "INTEREST_FUND";
      else if (["CHARITY", "GENERAL_CHARITY", "EMERGENCY", "COMMUNITY_WELFARE", "EDUCATION"].includes(cat)) fundType = "GENERAL_CHARITY";
      else fundType = "OTHER_SOURCES";
    }

    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Transaction: Create donation record, update raised total, & insert into financial ledger
    const [donationRecord, updatedCampaign, masjidDonation] = await prisma.$transaction([
      prisma.donationRecord.create({
        data: {
          campaignId: campaign.id,
          donorId: user ? user.id : null,
          donorName,
          donorEmail,
          amount: Number(amount),
          paymentMethod: "DEMO_PAYMENT",
          receiptNumber,
          notes: notes ? `[Donation Type: ${effectiveDonationType}] ${notes}` : `[Donation Type: ${effectiveDonationType}] Demo Sadaqah / Zakat Contribution`,
        },
      }),
      prisma.donationCampaign.update({
        where: { id: campaign.id },
        data: {
          raisedAmount: {
            increment: Number(amount),
          },
        },
      }),
      prisma.masjidDonation.create({
        data: {
          masjidId: campaign.masjidId,
          financialYearId: fy.id,
          donationDate: new Date(),
          amount: Number(amount),
          fundType,
          paymentMethod: "UPI",
          receiptNumber,
          donorName,
          donorEmail,
          description: `[Donation Type: ${effectiveDonationType}] Public Donation via Campaign: ${campaign.title}`,
          status: "VERIFIED",
          createdBy: user ? user.name : "Public Online Donor",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "JazakAllah Khair! Demo donation processed successfully.",
      receipt: {
        receiptNumber: donationRecord.receiptNumber,
        campaignTitle: campaign.title,
        masjidName: campaign.masjid?.name,
        donorName: donationRecord.donorName,
        donorEmail: donationRecord.donorEmail,
        amount: Number(donationRecord.amount),
        donationType: effectiveDonationType,
        date: donationRecord.createdAt,
        notes: donationRecord.notes,
      },
    });
  } catch (err: any) {
    console.error("Donation API error:", err);
    return NextResponse.json({ error: "Failed to process demo donation." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const masjidIdQuery = searchParams.get("masjidId");

    const adminMasjidId = await getAdminMasjidScope();

    const campaigns = await prisma.donationCampaign.findMany({
      where: {
        status: "ACTIVE",
        ...(campaignId ? { id: campaignId } : {}),
        ...(masjidIdQuery ? { masjidId: masjidIdQuery } : {}),
        ...(adminMasjidId ? { masjidId: adminMasjidId } : {}),
      },
      include: { 
        masjid: true,
        _count: { select: { donations: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch campaigns." }, { status: 500 });
  }
}
