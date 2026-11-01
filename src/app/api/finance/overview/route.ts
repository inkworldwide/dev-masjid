import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ensureFinancialDataForMasjid } from "@/lib/finance-seed";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedMasjidId = searchParams.get("masjidId");
    const yearName = searchParams.get("year") || "2026-2027";
    const month = searchParams.get("month") || "All";

    let targetMasjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      if (requestedMasjidId && requestedMasjidId !== "ALL") {
        targetMasjidId = requestedMasjidId;
      } else if (!requestedMasjidId) {
        const first = await prisma.masjid.findFirst();
        targetMasjidId = first?.id || null;
      }
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      targetMasjidId = permission?.masjidId || null;
    }

    // If a specific masjid is targeted, ensure seed data exists
    if (targetMasjidId) {
      await ensureFinancialDataForMasjid(targetMasjidId);
    } else if (user.role === "SUPER_ADMIN" && requestedMasjidId === "ALL") {
      const allMasjids = await prisma.masjid.findMany({ select: { id: true } });
      for (const m of allMasjids) {
        await ensureFinancialDataForMasjid(m.id);
      }
    }

    // Build masjid scope filter
    const masjidWhere = targetMasjidId ? { masjidId: targetMasjidId } : {};

    // 1. Fetch Opening Balances
    const openingBalances = await prisma.masjidOpeningBalance.findMany({
      where: masjidWhere,
      include: { financialYear: true },
    });

    let openGeneral = 0;
    let openZakat = 0;
    let openSadaqah = 0;
    let openCharity = 0;
    let openInterest = 0;
    let openCash = 0;
    let openBank = 0;

    openingBalances.forEach((ob) => {
      openGeneral += Number(ob.generalFund);
      openZakat += Number(ob.zakat);
      openSadaqah += Number(ob.sadaqah);
      openCharity += Number(ob.generalCharity);
      openInterest += Number(ob.interestFund);
      openCash += Number(ob.cashBalance);
      openBank += Number(ob.bankBalance);
    });

    const totalOpeningBalance = openGeneral + openZakat + openSadaqah + openCharity + openInterest;

    // 2. Fetch Live Rental Income from Properties & Tenants
    const properties = await prisma.masjidProperty.findMany({
      where: masjidWhere,
      include: { tenants: true },
    });

    let totalRentalIncome = 0;
    const rentalBreakdown: any[] = [];

    properties.forEach((prop) => {
      prop.tenants.forEach((tenant) => {
        const monthlyRent = Number(tenant.monthlyRent) || 0;
        // In full system, monthly rent collected for the active financial year / month
        const amount = monthlyRent;
        totalRentalIncome += amount;
        rentalBreakdown.push({
          id: tenant.id,
          propertyId: prop.id,
          propertyCustomId: prop.propertyCustomId,
          location: prop.location,
          tenantName: tenant.tenantName,
          tenantCustomId: tenant.tenantCustomId,
          contactPhone: tenant.contactPhone,
          amount,
          status: tenant.status,
          date: tenant.createdAt,
        });
      });
    });

    // 3. Fetch Other Income Entries
    const otherIncomes = await prisma.masjidOtherIncome.findMany({
      where: { ...masjidWhere, status: "VERIFIED" },
      orderBy: { incomeDate: "desc" },
    });

    let totalOtherIncome = 0;
    otherIncomes.forEach((oi) => {
      totalOtherIncome += Number(oi.amount);
    });

    // 4. Fetch Donations with strict Fund-wise Separation
    const donations = await prisma.masjidDonation.findMany({
      where: { ...masjidWhere, status: "VERIFIED" },
      orderBy: { donationDate: "desc" },
    });

    let donGeneral = 0;
    let donZakat = 0;
    let donSadaqah = 0;
    let donCharity = 0;
    let donInterest = 0;

    donations.forEach((d) => {
      const amt = Number(d.amount);
      if (d.fundType === "GENERAL_FUND") donGeneral += amt;
      else if (d.fundType === "ZAKAT") donZakat += amt;
      else if (d.fundType === "SADAQAH") donSadaqah += amt;
      else if (d.fundType === "GENERAL_CHARITY") donCharity += amt;
      else if (d.fundType === "INTEREST_FUND") donInterest += amt;
    });

    const totalDonations = donGeneral + donZakat + donSadaqah + donCharity + donInterest;
    const totalCharityFund = donZakat + donSadaqah + donCharity;

    // Total New Inflow = Rentals + Other Income + Donations
    const totalNewInflow = totalRentalIncome + totalOtherIncome + totalDonations;

    // TOTAL INCOME = Opening Balance + Total New Inflow
    const totalIncome = totalOpeningBalance + totalNewInflow;

    // 5. Fetch Expenditures
    const expenditures = await prisma.masjidExpenditure.findMany({
      where: { ...masjidWhere, status: "ACTIVE" },
      orderBy: { expenseDate: "desc" },
    });

    let expGeneralAdmin = 0;
    let expFestival = 0;
    let expCharitable = 0;
    let expMisc = 0;

    expenditures.forEach((e) => {
      const amt = Number(e.amount);
      if (e.category === "GENERAL_ADMINISTRATION") expGeneralAdmin += amt;
      else if (e.category === "FESTIVAL_EXPENSE") expFestival += amt;
      else if (e.category === "CHARITABLE_EXPENSE") expCharitable += amt;
      else if (e.category === "MISCELLANEOUS_EXPENSE") expMisc += amt;
    });

    const totalExpenditure = expGeneralAdmin + expFestival + expCharitable + expMisc;

    // 6. CLOSING BALANCE = Total Income - Total Expenditure
    const closingBalance = totalIncome - totalExpenditure;

    // 7. Bank Accounts & Live Balances
    const bankAccounts = await prisma.masjidBankAccount.findMany({
      where: { ...masjidWhere, isActive: true },
    });

    return NextResponse.json({
      success: true,
      targetMasjidId,
      financialYear: yearName,
      openingBalance: {
        total: totalOpeningBalance,
        generalFund: openGeneral,
        zakat: openZakat,
        sadaqah: openSadaqah,
        generalCharity: openCharity,
        interestFund: openInterest,
        cashBalance: openCash,
        bankBalance: openBank,
      },
      income: {
        totalIncome,
        totalNewInflow,
        rentalIncome: {
          total: totalRentalIncome,
          breakdown: rentalBreakdown,
        },
        otherIncome: {
          total: totalOtherIncome,
          entries: otherIncomes,
        },
        donations: {
          total: totalDonations,
          generalFund: donGeneral,
          charityFund: {
            total: totalCharityFund,
            zakat: donZakat,
            sadaqah: donSadaqah,
            generalCharity: donCharity,
          },
          interestFund: donInterest,
        },
      },
      expenditure: {
        totalExpenditure,
        generalAdministration: expGeneralAdmin,
        festivalExpenses: expFestival,
        charitableExpenses: expCharitable,
        miscellaneousExpenses: expMisc,
        entriesCount: expenditures.length,
      },
      closingBalance,
      bankAccounts,
    });
  } catch (error) {
    console.error("Failed to fetch financial overview:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
