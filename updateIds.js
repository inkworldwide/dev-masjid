const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const admins = await prisma.user.findMany({
    where: { role: 'MASJID_ADMIN' },
    include: { adminPermissions: { include: { masjid: { include: { city: true } } } } }
  });

  for (const admin of admins) {
    if (admin.adminPermissions.length > 0) {
      const city = admin.adminPermissions[0].masjid?.city?.name;
      const prefix = city ? city.substring(0, 3).toUpperCase() : "ADM";
      const newId = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.user.update({
        where: { id: admin.id },
        data: { customId: newId }
      });
      console.log(`Updated ${admin.name} to ${newId}`);
    } else {
      const newId = `USR${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.user.update({
        where: { id: admin.id },
        data: { customId: newId }
      });
    }
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
