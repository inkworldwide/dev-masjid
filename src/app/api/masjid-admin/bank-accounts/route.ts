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

    if (!targetMasjidId && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: true, bankAccounts: [] });
    }

    const where = targetMasjidId ? { masjidId: targetMasjidId } : {};

    const bankAccounts = await prisma.masjidBankAccount.findMany({
      where,
      include: { masjid: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, bankAccounts });
  } catch (error) {
    console.error("Failed to fetch bank accounts:", error);
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
      bankName,
      accountNumber,
      accountTitle,
      accountType,
      ifscCode,
      upiId,
      openingBalance,
    } = body;

    let targetMasjidId: string | null = masjidId;
    if (user.role === "MASJID_ADMIN") {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      targetMasjidId = permission?.masjidId || null;
    }

    if (!targetMasjidId) {
      return NextResponse.json({ error: "Masjid account selection is required" }, { status: 400 });
    }

    if (!bankName || !bankName.trim()) {
      return NextResponse.json({ error: "Bank Name is required" }, { status: 400 });
    }

    if (!accountNumber || !accountNumber.trim()) {
      return NextResponse.json({ error: "Account Number is required" }, { status: 400 });
    }

    const accountNumberLast4 = accountNumber.trim().slice(-4) || "0000";

    const bankAccount = await prisma.masjidBankAccount.create({
      data: {
        masjidId: targetMasjidId,
        bankName: bankName.trim(),
        accountNumberLast4,
        accountTitle: accountTitle?.trim() || "Main Mosque Account",
        accountType: accountType || "SAVINGS",
        ifscCode: ifscCode?.trim() || null,
        upiId: upiId?.trim() || null,
        currentBalance: openingBalance ? Number(openingBalance) : 0.00,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, bankAccount });
  } catch (error) {
    console.error("Failed to create bank account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, bankName, accountNumber, accountTitle, accountType, ifscCode, upiId, balance } = body;

    if (!id) {
      return NextResponse.json({ error: "Bank Account ID is required" }, { status: 400 });
    }

    const existing = await prisma.masjidBankAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bank Account not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (bankName) updateData.bankName = bankName.trim();
    if (accountTitle) updateData.accountTitle = accountTitle.trim();
    if (accountType) updateData.accountType = accountType;
    if (ifscCode !== undefined) updateData.ifscCode = ifscCode ? ifscCode.trim() : null;
    if (upiId !== undefined) updateData.upiId = upiId ? upiId.trim() : null;
    if (accountNumber && accountNumber.trim()) {
      updateData.accountNumberLast4 = accountNumber.trim().slice(-4);
    }
    if (balance !== undefined) updateData.currentBalance = Number(balance);

    const updated = await prisma.masjidBankAccount.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, bankAccount: updated });
  } catch (error) {
    console.error("Failed to update bank account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bank Account ID is required" }, { status: 400 });
    }

    await prisma.masjidBankAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete bank account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
