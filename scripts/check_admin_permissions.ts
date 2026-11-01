import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: "MASJID_ADMIN" },
    include: { adminPermissions: { include: { masjid: true } } },
  });

  console.log("=== MASJID ADMIN USERS ===");
  for (const u of users) {
    console.log(`User ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Phone: ${u.phone}`);
    console.log(`  Permissions Count: ${u.adminPermissions.length}`);
    for (const p of u.adminPermissions) {
      console.log(`    -> Masjid: ${p.masjid?.name} (${p.masjidId})`);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
