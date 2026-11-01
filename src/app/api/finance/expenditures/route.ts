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
    const category = searchParams.get("category");
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
    if (category && category !== "ALL") where.category = category;
    if (fundType && fundType !== "ALL") where.fundType = fundType;
    if (paymentMethod && paymentMethod !== "ALL") where.paymentMethod = paymentMethod;

    if (search) {
      where.OR = [
        { payeeName: { contains: search, mode: "insensitive" } },
        { billInvoiceNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
      ];
    }

    const expenditures = await prisma.masjidExpenditure.findMany({
      where,
      include: { masjid: { select: { id: true, name: true, location: true } } },
      orderBy: { expenseDate: "desc" },
    });

    return NextResponse.json({ success: true, expenditures });
  } catch (error) {
    console.error("Failed to fetch expenditures:", error);
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
      expenseDate,
      category,
      subcategory,
      fundType,
      description,
      amount,
      paymentMethod,
      payeeName,
      billInvoiceNumber,
      referenceNumber,
      billDocumentUrl,
      chequeNumber,
      bankName,
      upiTransactionId,
      utrNumber,
      notes,
      disbursedBy,
      amountGivenBy,
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

    if (!billInvoiceNumber || !billInvoiceNumber.trim()) {
      return NextResponse.json({ error: "Bill / Voucher number is compulsory." }, { status: 400 });
    }

    const existingBill = await prisma.masjidExpenditure.findFirst({
      where: {
        masjidId: targetMasjidId,
        billInvoiceNumber: billInvoiceNumber.trim(),
      },
    });

    if (existingBill) {
      return NextResponse.json({
        error: `Bill/Voucher number "${billInvoiceNumber.trim()}" already exists! Each voucher number must be unique.`,
      }, { status: 400 });
    }

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

    const expenditure = await prisma.masjidExpenditure.create({
      data: {
        masjidId: targetMasjidId,
        financialYearId: fy.id,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        category: category || "GENERAL_ADMINISTRATION",
        subcategory: subcategory || "General Admin",
        fundType: fundType || "GENERAL_FUND",
        description: description || "Mosque expense voucher",
        amount: Number(amount),
        paymentMethod: paymentMethod || "CASH",
        payeeName: payeeName || "Vendor / Staff",
        billInvoiceNumber,
        referenceNumber: referenceNumber || null,
        billDocumentUrl: billDocumentUrl || null,
        chequeNumber: chequeNumber || null,
        bankName: bankName || null,
        upiTransactionId: upiTransactionId || null,
        utrNumber: utrNumber || null,
        notes: notes || null,
        disbursedBy: disbursedBy || amountGivenBy || null,
        status: "ACTIVE",
        createdBy: user.name || "Finance Admin",
      },
    });

    // Create Audit Log
    await prisma.financialAuditLog.create({
      data: {
        masjidId: targetMasjidId,
        userId: user.id,
        action: "CREATE_EXPENDITURE",
        entityType: "EXPENDITURE",
        entityId: expenditure.id,
        newValues: {
          amount: Number(amount),
          category,
          subcategory,
          billInvoiceNumber,
          payeeName,
        },
      },
    });

    return NextResponse.json({ success: true, expenditure });
  } catch (error) {
    console.error("Failed to create expenditure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action, voidReason } = body;

    if (!id) return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });

    const existing = await prisma.masjidExpenditure.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Expenditure not found" }, { status: 404 });

    if (action === "VOID") {
      if (!voidReason) return NextResponse.json({ error: "Reason for voiding is required" }, { status: 400 });

      const updated = await prisma.masjidExpenditure.update({
        where: { id },
        data: {
          status: "VOID",
          notes: existing.notes ? `${existing.notes} | VOIDED: ${voidReason}` : `VOIDED: ${voidReason}`,
        },
      });

      await prisma.financialAuditLog.create({
        data: {
          masjidId: existing.masjidId,
          userId: user.id,
          action: "VOID_EXPENDITURE",
          entityType: "EXPENDITURE",
          entityId: id,
          previousValues: { status: existing.status },
          newValues: { status: "VOID" },
          reason: voidReason,
        },
      });

      return NextResponse.json({ success: true, expenditure: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update expenditure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
