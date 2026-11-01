import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_ENABLED_MODULES = [
  "view_dashboard",
  "manage_profile",
  "manage_members",
  "manage_announcements",
  "manage_events",
  "manage_media",
  "manage_donations",
  "manage_finances",
  "manage_documents",
  "manage_staff",
  "manage_property",
  "view_reports"
];

async function main() {
  const masjids = await prisma.masjid.findMany();
  console.log(`Found ${masjids.length} total masjids.`);

  for (const masjid of masjids) {
    if (!masjid.enabledModules || (Array.isArray(masjid.enabledModules) && (masjid.enabledModules as string[]).length === 0)) {
      console.log(`Setting default modules for masjid: ${masjid.name} (${masjid.id})`);
      await prisma.masjid.update({
        where: { id: masjid.id },
        data: { enabledModules: DEFAULT_ENABLED_MODULES },
      });
    } else {
      console.log(`Masjid "${masjid.name}" already has modules configured:`, masjid.enabledModules);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
