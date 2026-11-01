import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const masjid = await prisma.masjid.findFirst();
  if (!masjid) {
    console.error("No Masjid found to attach campaigns to.");
    process.exit(1);
  }

  const categories = [
    { cat: "CONSTRUCTION", title: "New Wing Construction", purpose: "Building a new prayer hall to accommodate more worshippers.", img: "https://images.unsplash.com/photo-1542617666-b3378b27341a?q=80&w=400" },
    { cat: "MAINTENANCE", title: "Annual AC Maintenance", purpose: "Servicing all air conditioning units before summer.", img: "https://images.unsplash.com/photo-1588661601614-239611e3b6eb?q=80&w=400" },
    { cat: "EDUCATION", title: "Madrasa Book Drive", purpose: "Providing new Quran copies and Islamic literature for students.", img: "https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=400" },
    { cat: "ZAKAT", title: "Ramadan Zakat Distribution", purpose: "Collecting Zakat al-Fitr for local families in need.", img: "https://images.unsplash.com/photo-1620050853746-8805fdbefeb4?q=80&w=400" },
    { cat: "CHARITY", title: "Winter Blanket Charity", purpose: "Providing warm blankets to the homeless during cold months.", img: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=400" },
    { cat: "COMMUNITY_WELFARE", title: "Free Medical Camp", purpose: "A weekend clinic providing free checkups for the community.", img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400" },
    { cat: "EMERGENCY", title: "Flood Relief Fund", purpose: "Emergency aid for those affected by recent flooding in the region.", img: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=400" }
  ];

  for (const c of categories) {
    await prisma.donationCampaign.create({
      data: {
        masjidId: masjid.id,
        title: c.title,
        category: c.cat as any,
        goalAmount: 500000,
        raisedAmount: Math.floor(Math.random() * 300000) + 50000,
        purpose: c.purpose,
        coverImage: c.img,
        images: [c.img],
        status: "ACTIVE"
      }
    });
    console.log(`Created campaign for ${c.cat}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
