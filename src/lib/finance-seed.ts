import { prisma } from "./prisma";

export async function ensureFinancialDataForMasjid(masjidId: string) {
  try {
    const masjid = await prisma.masjid.findUnique({ where: { id: masjidId } });
    if (!masjid) return null;

    // 1. Ensure Financial Year (2026-2027)
    let fy = await prisma.masjidFinancialYear.findUnique({
      where: {
        masjidId_yearName: {
          masjidId,
          yearName: "2026-2027",
        },
      },
    });

    if (!fy) {
      fy = await prisma.masjidFinancialYear.create({
        data: {
          masjidId,
          yearName: "2026-2027",
          startDate: new Date("2026-04-01"),
          endDate: new Date("2027-03-31"),
          isClosed: false,
        },
      });
    }

    const isDemoMasjid = masjid.name.includes("Jama Masjid") || masjid.name.toLowerCase().includes("enam");

    // 2. Ensure Opening Balance
    const existingOB = await prisma.masjidOpeningBalance.findFirst({
      where: { financialYearId: fy.id, masjidId },
    });

    if (!existingOB) {
      await prisma.masjidOpeningBalance.create({
        data: {
          financialYearId: fy.id,
          masjidId,
          cashBalance: isDemoMasjid ? 45000 : 0,
          bankBalance: isDemoMasjid ? 725000 : 0,
          generalFund: isDemoMasjid ? 350000 : 0,
          zakat: isDemoMasjid ? 200000 : 0,
          sadaqah: isDemoMasjid ? 120000 : 0,
          generalCharity: isDemoMasjid ? 80000 : 0,
          interestFund: isDemoMasjid ? 20000 : 0,
          isLocked: true,
          notes: isDemoMasjid ? "Audited opening balance carried forward from FY 2025-2026." : "Initial opening balance.",
        },
      });
    }

    if (!isDemoMasjid) return fy;

    // 3. Ensure Bank Accounts
    const bankCount = await prisma.masjidBankAccount.count({ where: { masjidId } });
    if (bankCount === 0) {
      await prisma.masjidBankAccount.createMany({
        data: [
          {
            masjidId,
            bankName: "State Bank of India",
            accountNumberLast4: "4912",
            accountTitle: `${masjid.name} Trust General A/C`,
            accountType: "CURRENT",
            currentBalance: 520000,
            isActive: true,
          },
          {
            masjidId,
            bankName: "HDFC Bank",
            accountNumberLast4: "8821",
            accountTitle: `${masjid.name} Zakat & Charity A/C`,
            accountType: "SAVINGS",
            currentBalance: 250000,
            isActive: true,
          },
        ],
      });
    }

    // 4. Ensure Initial Realistic Donations
    const donCount = await prisma.masjidDonation.count({ where: { masjidId } });
    if (donCount === 0) {
      await prisma.masjidDonation.createMany({
        data: [
          {
            masjidId,
            financialYearId: fy.id,
            donationDate: new Date("2026-08-18T17:42:00Z"),
            amount: 250000,
            fundType: "ZAKAT",
            paymentMethod: "UPI",
            receiptNumber: `REC-${masjid.name.substring(0, 3).toUpperCase()}-2026-081`,
            donorName: "Mohammed Imran",
            donorPhone: "+91 98450 11223",
            donorEmail: "imran.m@gmail.com",
            donorAddress: "Nagwara, Bangalore",
            description: "Annual Zakat Contribution for Widows & Destitute Aid",
            upiTransactionId: "UPI/20260818/98812039",
            status: "VERIFIED",
            createdBy: "Hafiz Zubair (Trustee)",
          },
          {
            masjidId,
            financialYearId: fy.id,
            donationDate: new Date("2026-08-18T14:15:00Z"),
            amount: 150000,
            fundType: "GENERAL_FUND",
            paymentMethod: "NEFT_RTGS",
            receiptNumber: `REC-${masjid.name.substring(0, 3).toUpperCase()}-2026-082`,
            donorName: "Syed Zaid Khan",
            donorPhone: "+91 99160 44556",
            donorEmail: "zaid.khan@outlook.com",
            description: "Masjid Flooring & Wudu Khana Upkeep Support",
            utrNumber: "SBIN88291048821",
            bankName: "State Bank of India",
            status: "VERIFIED",
            createdBy: "Hafiz Zubair (Trustee)",
          },
          {
            masjidId,
            financialYearId: fy.id,
            donationDate: new Date("2026-08-14T14:00:00Z"),
            amount: 50000,
            fundType: "SADAQAH",
            paymentMethod: "CASH",
            receiptNumber: `REC-${masjid.name.substring(0, 3).toUpperCase()}-2026-095`,
            donorName: "Abdul Rahman",
            donorPhone: "+91 97410 77889",
            description: "Friday Jummah Community Sadaqah",
            status: "VERIFIED",
            createdBy: "Hafiz Zubair (Trustee)",
          },
          {
            masjidId,
            financialYearId: fy.id,
            donationDate: new Date("2026-08-01T10:00:00Z"),
            amount: 20000,
            fundType: "INTEREST_FUND",
            paymentMethod: "NEFT_RTGS",
            receiptNumber: `REC-${masjid.name.substring(0, 3).toUpperCase()}-2026-041`,
            donorName: "Khurram Parvez",
            donorPhone: "+91 98800 33441",
            description: "Bank Interest Disposal for Public Toilet Upkeep",
            utrNumber: "HDFC991204881",
            bankName: "HDFC Bank",
            status: "VERIFIED",
            createdBy: "Central Office",
          },
        ],
      });
    }

    // 5. Ensure Other Income (Sponsorships / Special drives)
    const otherCount = await prisma.masjidOtherIncome.count({ where: { masjidId } });
    if (otherCount === 0) {
      await prisma.masjidOtherIncome.createMany({
        data: [
          {
            masjidId,
            financialYearId: fy.id,
            sourceName: "Water Purifier Sponsorship",
            description: "Commercial RO Water Plant Sponsorship for Musallees",
            amount: 35000,
            incomeDate: new Date("2026-08-12T20:20:00Z"),
            paymentMethod: "CASH",
            referenceNumber: `OTH-${masjid.name.substring(0, 3).toUpperCase()}-2026-012`,
            fundType: "GENERAL_FUND",
            collectorName: "Imam Sahab",
            status: "VERIFIED",
            createdBy: "Imam Sahab",
          },
        ],
      });
    }

    // 6. Ensure Realistic Expenditures
    const expCount = await prisma.masjidExpenditure.count({ where: { masjidId } });
    if (expCount === 0) {
      await prisma.masjidExpenditure.createMany({
        data: [
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-10T10:30:00Z"),
            category: "GENERAL_ADMINISTRATION",
            subcategory: "Staff Salary",
            fundType: "GENERAL_FUND",
            description: "Monthly Imam Honorarium / Salary - Aug 2026",
            amount: 35000,
            paymentMethod: "NEFT_RTGS",
            payeeName: "Maulana Hafiz Tariq (Head Imam)",
            billInvoiceNumber: "VOUCH-SAL-01",
            utrNumber: "SBIN99281048",
            bankName: "State Bank of India",
            notes: "Approved by Mutawalli Committee",
            status: "ACTIVE",
            createdBy: "Secretary Sahab",
          },
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-10T11:00:00Z"),
            category: "GENERAL_ADMINISTRATION",
            subcategory: "Staff Salary",
            fundType: "GENERAL_FUND",
            description: "Muezzin & 2 Cleaning Staff Salaries",
            amount: 45000,
            paymentMethod: "CASH",
            payeeName: "Bilal Muezzin & Cleaners",
            billInvoiceNumber: "VOUCH-SAL-02",
            status: "ACTIVE",
            createdBy: "Secretary Sahab",
          },
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-12T15:15:00Z"),
            category: "GENERAL_ADMINISTRATION",
            subcategory: "Electricity",
            fundType: "GENERAL_FUND",
            description: "Main Prayer Hall & Wudu Khana Electricity Bill - Aug",
            amount: 14200,
            paymentMethod: "UPI",
            payeeName: "BESCOM Power Distribution",
            billInvoiceNumber: "BILL-EB-882109",
            upiTransactionId: "UPI/BESCOM/88921102",
            billDocumentUrl: "https://pdfobject.com/pdf/sample.pdf",
            status: "ACTIVE",
            createdBy: "Accountant",
          },
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-13T14:45:00Z"),
            category: "GENERAL_ADMINISTRATION",
            subcategory: "Water",
            fundType: "GENERAL_FUND",
            description: "Monthly Water Supply & Tanker Charges",
            amount: 4800,
            paymentMethod: "UPI",
            payeeName: "BWSSB Water Board",
            billInvoiceNumber: "BILL-WB-4410",
            status: "ACTIVE",
            createdBy: "Accountant",
          },
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-15T16:30:00Z"),
            category: "GENERAL_ADMINISTRATION",
            subcategory: "Maintenance",
            fundType: "GENERAL_FUND",
            description: "4 Central AC Unit Deep Servicing & Gas Refill",
            amount: 18500,
            paymentMethod: "CHEQUE",
            payeeName: "Al-Noor Electricals & AC Service",
            billInvoiceNumber: "INV-ALN-781",
            chequeNumber: "CHQ-004918",
            bankName: "State Bank of India",
            status: "ACTIVE",
            createdBy: "Accountant",
          },
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-15T09:00:00Z"),
            category: "FESTIVAL_EXPENSE",
            subcategory: "Independence Day / Milad Event",
            fundType: "GENERAL_FUND",
            description: "Student Madrasa Gathering, Sweets & Audio System",
            amount: 12000,
            paymentMethod: "CASH",
            payeeName: "City Sound & Madrasa Catering",
            billInvoiceNumber: "FEST-2026-08",
            status: "ACTIVE",
            createdBy: "Trustee",
          },
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-16T17:00:00Z"),
            category: "CHARITABLE_EXPENSE",
            subcategory: "Zakat / Sadaqah Needy Aid",
            fundType: "ZAKAT",
            description: "Direct Monthly Ration Kits & Medical Assistance for 50 Destitute Families",
            amount: 65000,
            paymentMethod: "CASH",
            payeeName: "Beneficiary Families Register #4",
            billInvoiceNumber: "AID-DIST-08",
            status: "ACTIVE",
            createdBy: "Zakat Committee",
          },
          {
            masjidId,
            financialYearId: fy.id,
            expenseDate: new Date("2026-08-17T13:30:00Z"),
            category: "MISCELLANEOUS_EXPENSE",
            subcategory: "Stationery & Cleaning",
            fundType: "GENERAL_FUND",
            description: "Floor Cleaners, Wudu Mats, Phenyl & Register Books",
            amount: 5500,
            paymentMethod: "CASH",
            payeeName: "City Mart Wholesale",
            billInvoiceNumber: "MISC-0912",
            status: "ACTIVE",
            createdBy: "Accountant",
          },
        ],
      });
    }

    return fy;
  } catch (error) {
    console.error("Failed to ensure financial data for masjid:", error);
    return null;
  }
}
