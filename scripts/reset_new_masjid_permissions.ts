import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Reset Rabbani Masjid or any masjid where permissions were auto-assigned to []
  const result = await prisma.masjid.updateMany({
    where: {
      name: { contains: "Rabbani", mode: "insensitive" },
    },
    data: {
      enabledModules: [],
    },
  });

  console.log(`Reset permissions for Rabbani Masjid (${result.count} updated).`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
