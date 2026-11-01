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
    const yearName = searchParams.get("year") || "2026-2027";
    const month = searchParams.get("month") || "August 2026";

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

    if (!targetMasjidId) {
      return NextResponse.json({ error: "Masjid is required" }, { status: 400 });
    }

    let fy = await prisma.masjidFinancialYear.findFirst({
      where: { masjidId: targetMasjidId, yearName },
    });

    if (!fy) {
      fy = await prisma.masjidFinancialYear.create({
        data: {
          masjidId: targetMasjidId,
          yearName,
          startDate: new Date("2026-04-01"),
          endDate: new Date("2027-03-31"),
        },
      });
    }

    // 1. Fetch Existing Audit Record if any
    const existingAudit = await prisma.masjidManualAudit.findFirst({
      where: {
        masjidId: targetMasjidId,
        financialYearId: fy.id,
        month,
      },
      include: { adjustments: true },
    });

    // 2. Fetch System Opening Balance
    const ob = await prisma.masjidOpeningBalance.findFirst({
      where: { masjidId: targetMasjidId, financialYearId: fy.id },
    });

    const openGen = Number(ob?.generalFund || 0);
    const openZakat = Number(ob?.zakat || 0);
    const openSad = Number(ob?.sadaqah || 0);
    const openChar = Number(ob?.generalCharity || 0);
    const openInt = Number(ob?.interestFund || 0);
    const systemOpening = openGen + openZakat + openSad + openChar + openInt;
    const systemCash = Number(ob?.cashBalance || 45000);
    const systemBank = Number(ob?.bankBalance || 725000);

    // 3. System Inflow Components
    const properties = await prisma.masjidProperty.findMany({
      where: { masjidId: targetMasjidId },
      include: { tenants: true },
    });
    let systemRent = 0;
    properties.forEach((p) => {
      p.tenants.forEach((t) => {
        systemRent += Number(t.monthlyRent) || 0;
      });
    });

    const otherIncomes = await prisma.masjidOtherIncome.findMany({
      where: { masjidId: targetMasjidId, status: "VERIFIED" },
    });
    const systemOther = otherIncomes.reduce((s, i) => s + Number(i.amount), 0);

    const donations = await prisma.masjidDonation.findMany({
      where: { masjidId: targetMasjidId, status: "VERIFIED" },
    });
    let donGen = 0;
    let donZakat = 0;
    let donSad = 0;
    let donChar = 0;
    let donInt = 0;
    donations.forEach((d) => {
      const a = Number(d.amount);
      if (d.fundType === "GENERAL_FUND") donGen += a;
      else if (d.fundType === "ZAKAT") donZakat += a;
      else if (d.fundType === "SADAQAH") donSad += a;
      else if (d.fundType === "GENERAL_CHARITY") donChar += a;
      else if (d.fundType === "INTEREST_FUND") donInt += a;
    });
    const systemDonations = donGen + donZakat + donSad + donChar + donInt;
    const systemTotalIncome = systemOpening + systemRent + systemOther + systemDonations;

    // 4. System Expenditures
    const expenditures = await prisma.masjidExpenditure.findMany({
      where: { masjidId: targetMasjidId, status: "ACTIVE" },
    });
    let expGen = 0;
    let expFest = 0;
    let expChar = 0;
    let expMisc = 0;
    expenditures.forEach((e) => {
      const a = Number(e.amount);
      if (e.category === "GENERAL_ADMINISTRATION") expGen += a;
      else if (e.category === "FESTIVAL_EXPENSE") expFest += a;
      else if (e.category === "CHARITABLE_EXPENSE") expChar += a;
      else if (e.category === "MISCELLANEOUS_EXPENSE") expMisc += a;
    });
    const systemTotalExp = expGen + expFest + expChar + expMisc;
    const systemClosing = systemTotalIncome - systemTotalExp;

    // 5. Bank Accounts
    const bankAccounts = await prisma.masjidBankAccount.findMany({
      where: { masjidId: targetMasjidId, isActive: true },
    });

    return NextResponse.json({
      success: true,
      masjidId: targetMasjidId,
      financialYear: yearName,
      month,
      auditRecord: existingAudit,
      systemData: {
        openingBalance: {
          total: systemOpening,
          generalFund: openGen,
          zakat: openZakat,
          sadaqah: openSad,
          generalCharity: openChar,
          interestFund: openInt,
          cash: systemCash,
          bank: systemBank,
        },
        income: {
          total: systemTotalIncome,
          rent: systemRent,
          other: systemOther,
          generalDonations: donGen,
          zakat: donZakat,
          sadaqah: donSad,
          generalCharity: donChar,
          interest: donInt,
          totalDonations: systemDonations,
        },
        expenditure: {
          total: systemTotalExp,
          generalAdmin: expGen,
          festival: expFest,
          charitable: expChar,
          misc: expMisc,
        },
        closingBalance: systemClosing,
        cashBalance: systemCash,
        bankBalance: systemBank,
        bankAccounts,
      },
    });
  } catch (error) {
    console.error("Failed to fetch manual audit data:", error);
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
      yearName,
      month,
      actualOpeningBalance,
      actualTotalIncome,
      actualTotalExpenditure,
      actualCashCounted,
      actualBankBalance,
      auditRemarks,
      comparisonData,
      status,
      adjustments,
    } = body;

    if (!masjidId) return NextResponse.json({ error: "Masjid is required" }, { status: 400 });

    let fy = await prisma.masjidFinancialYear.findFirst({
      where: { masjidId, yearName: yearName || "2026-2027" },
    });

    if (!fy) {
      fy = await prisma.masjidFinancialYear.create({
        data: {
          masjidId,
          yearName: yearName || "2026-2027",
          startDate: new Date("2026-04-01"),
          endDate: new Date("2027-03-31"),
        },
      });
    }

    // Fetch system values to calculate real differences
    const ob = await prisma.masjidOpeningBalance.findFirst({
      where: { masjidId, financialYearId: fy.id },
    });
    const systemOpening = Number(ob?.generalFund || 0) + Number(ob?.zakat || 0) + Number(ob?.sadaqah || 0) + Number(ob?.generalCharity || 0) + Number(ob?.interestFund || 0);
    const systemCash = Number(ob?.cashBalance || 45000);
    const systemBank = Number(ob?.bankBalance || 725000);

    const donations = await prisma.masjidDonation.findMany({ where: { masjidId, status: "VERIFIED" } });
    const donTot = donations.reduce((s, d) => s + Number(d.amount), 0);
    const otherIncomes = await prisma.masjidOtherIncome.findMany({ where: { masjidId, status: "VERIFIED" } });
    const otherTot = otherIncomes.reduce((s, o) => s + Number(o.amount), 0);
    const properties = await prisma.masjidProperty.findMany({ where: { masjidId }, include: { tenants: true } });
    let rentTot = 0;
    properties.forEach(p => p.tenants.forEach(t => { rentTot += Number(t.monthlyRent) || 0; }));

    const systemIncome = systemOpening + rentTot + otherTot + donTot;

    const expenditures = await prisma.masjidExpenditure.findMany({ where: { masjidId, status: "ACTIVE" } });
    const systemExp = expenditures.reduce((s, e) => s + Number(e.amount), 0);
    const systemClosing = systemIncome - systemExp;

    const actOpen = Number(actualOpeningBalance ?? systemOpening);
    const actInc = Number(actualTotalIncome ?? systemIncome);
    const actExp = Number(actualTotalExpenditure ?? systemExp);
    const actClosing = actOpen + actInc - actExp;
    const actCash = Number(actualCashCounted ?? systemCash);
    const actBank = Number(actualBankBalance ?? systemBank);

    const openDiff = actOpen - systemOpening;
    const incDiff = actInc - systemIncome;
    const expDiff = actExp - systemExp;
    const cashDiff = actCash - systemCash;
    const bankDiff = actBank - systemBank;

    const isReconciled = openDiff === 0 && incDiff === 0 && expDiff === 0 && cashDiff === 0 && bankDiff === 0;
    const finalStatus = status || (isReconciled ? "RECONCILED" : "DIFFERENCE_FOUND");

    const audit = await prisma.masjidManualAudit.upsert({
      where: {
        masjidId_financialYearId_month: {
          masjidId,
          financialYearId: fy.id,
          month: month || "August 2026",
        },
      },
      update: {
        status: finalStatus,
        systemOpeningBalance: systemOpening,
        actualOpeningBalance: actOpen,
        openingDifference: openDiff,
        systemTotalIncome: systemIncome,
        verifiedTotalIncome: actInc,
        incomeDifference: incDiff,
        systemTotalExpenditure: systemExp,
        verifiedTotalExpenditure: actExp,
        expenditureDifference: expDiff,
        systemClosingBalance: systemClosing,
        verifiedClosingBalance: actClosing,
        systemCashBalance: systemCash,
        actualCashCounted: actCash,
        cashDifference: cashDiff,
        systemBankBalance: systemBank,
        actualBankBalance: actBank,
        bankDifference: bankDiff,
        auditRemarks: auditRemarks || null,
        comparisonData: comparisonData || {},
        auditedBy: user.name,
        approvedBy: finalStatus === "APPROVED" || finalStatus === "LOCKED" ? user.name : null,
        approvedAt: finalStatus === "APPROVED" || finalStatus === "LOCKED" ? new Date() : null,
      },
      create: {
        masjidId,
        financialYearId: fy.id,
        month: month || "August 2026",
        status: finalStatus,
        systemOpeningBalance: systemOpening,
        actualOpeningBalance: actOpen,
        openingDifference: openDiff,
        systemTotalIncome: systemIncome,
        verifiedTotalIncome: actInc,
        incomeDifference: incDiff,
        systemTotalExpenditure: systemExp,
        verifiedTotalExpenditure: actExp,
        expenditureDifference: expDiff,
        systemClosingBalance: systemClosing,
        verifiedClosingBalance: actClosing,
        systemCashBalance: systemCash,
        actualCashCounted: actCash,
        cashDifference: cashDiff,
        systemBankBalance: systemBank,
        actualBankBalance: actBank,
        bankDifference: bankDiff,
        auditRemarks: auditRemarks || null,
        comparisonData: comparisonData || {},
        auditedBy: user.name,
        approvedBy: finalStatus === "APPROVED" || finalStatus === "LOCKED" ? user.name : null,
        approvedAt: finalStatus === "APPROVED" || finalStatus === "LOCKED" ? new Date() : null,
      },
    });

    // Save adjustments if any
    if (adjustments && Array.isArray(adjustments)) {
      for (const adj of adjustments) {
        if (adj.amount && adj.reason) {
          await prisma.masjidFinancialAdjustment.create({
            data: {
              masjidId,
              manualAuditId: audit.id,
              amount: Number(adj.amount),
              type: adj.type || "INCOME_ADJUSTMENT",
              reason: adj.reason,
              remarks: adj.remarks || null,
              approvedBy: user.name,
            },
          });
        }
      }
    }

    // Audit Log
    await prisma.financialAuditLog.create({
      data: {
        masjidId,
        userId: user.id,
        action: finalStatus === "LOCKED" ? "LOCK_AUDIT" : "SAVE_MANUAL_AUDIT",
        entityType: "MANUAL_AUDIT",
        entityId: audit.id,
        newValues: {
          month,
          status: finalStatus,
          openDiff,
          incDiff,
          expDiff,
          cashDiff,
          bankDiff,
        },
      },
    });

    return NextResponse.json({ success: true, audit });
  } catch (error) {
    console.error("Failed to save manual audit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
