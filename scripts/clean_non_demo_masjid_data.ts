import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const masjids = await prisma.masjid.findMany();

  for (const m of masjids) {
    const isDemo = m.name.includes("Jama Masjid") || m.name.toLowerCase().includes("enam");
    if (!isDemo) {
      console.log(`Cleaning mock data for non-demo masjid: ${m.name} (${m.id})`);

      // Delete fake donations
      await prisma.masjidDonation.deleteMany({ where: { masjidId: m.id } });

      // Delete fake expenditures
      await prisma.masjidExpenditure.deleteMany({ where: { masjidId: m.id } });

      // Delete fake other income
      await prisma.masjidOtherIncome.deleteMany({ where: { masjidId: m.id } });

      // Delete fake bank accounts
      await prisma.masjidBankAccount.deleteMany({ where: { masjidId: m.id } });

      // Reset Opening Balance to 0
      await prisma.masjidOpeningBalance.updateMany({
        where: { masjidId: m.id },
        data: {
          cashBalance: 0,
          bankBalance: 0,
          generalFund: 0,
          zakat: 0,
          sadaqah: 0,
          generalCharity: 0,
          interestFund: 0,
        },
      });
    }
  }

  console.log("Non-demo masjid data cleanup complete! All new masjids are now 100% clean and empty.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
