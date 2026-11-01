import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const bankAccounts = await prisma.masjidBankAccount.findMany({
    include: { masjid: true },
  });

  console.log(`Found ${bankAccounts.length} bank accounts in database.`);

  for (const acc of bankAccounts) {
    if (acc.accountTitle.includes("Enam Masjid") && acc.masjid.name !== "Enam masjid") {
      const newTitle = acc.accountTitle.replace(/Enam Masjid/g, acc.masjid.name);
      console.log(`Updating bank account title for ${acc.masjid.name}: "${acc.accountTitle}" -> "${newTitle}"`);
      await prisma.masjidBankAccount.update({
        where: { id: acc.id },
        data: { accountTitle: newTitle },
      });
    }
  }

  console.log("Bank account titles fix completed successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
