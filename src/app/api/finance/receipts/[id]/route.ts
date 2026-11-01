import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

function numberToWordsINR(num: number): string {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return "";
  let str = "";
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
  str += Number(n[5]) !== 0 ? ((str !== "" ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])])) : "";
  return str.trim() ? `${str.trim()} Rupees Only` : "Zero Rupees";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const donation = await prisma.masjidDonation.findFirst({
      where: {
        OR: [{ id }, { receiptNumber: id }],
      },
      include: {
        masjid: {
          select: {
            id: true,
            name: true,
            address: true,
            location: true,
            contactNumber: true,
            registrationNo: true,
          },
        },
      },
    });

    if (!donation) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const amountInWords = numberToWordsINR(Number(donation.amount));

    return NextResponse.json({
      success: true,
      receipt: {
        receiptNumber: donation.receiptNumber,
        donationDate: donation.donationDate,
        amount: Number(donation.amount),
        amountInWords,
        fundType: donation.fundType,
        paymentMethod: donation.paymentMethod,
        donorName: donation.donorName,
        donorPhone: donation.donorPhone,
        donorEmail: donation.donorEmail,
        donorAddress: donation.donorAddress,
        description: donation.description,
        chequeNumber: donation.chequeNumber,
        bankName: donation.bankName,
        upiTransactionId: donation.upiTransactionId,
        utrNumber: donation.utrNumber,
        status: donation.status,
        masjid: donation.masjid,
        createdBy: donation.createdBy,
      },
    });
  } catch (error) {
    console.error("Failed to fetch receipt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
