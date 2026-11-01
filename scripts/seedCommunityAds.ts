import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAds() {
  console.log("🌱 Seeding MOsQuE Community Sponsors & Ads Buzz...");

  const adsData = [
    {
      title: "Al-Haramain VIP Deluxe Umrah & Hajj Tours 2026",
      sponsorName: "Al-Haramain International Travels",
      category: "HAJJ_UMRAH" as const,
      description: "Direct flights from Delhi & Mumbai, 5-star clock tower hotels in Makkah & Madinah, guided Ziyarat by senior scholars.",
      imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://example.com/umrah-tours",
      location: "New Delhi / Mumbai",
      contactPhone: "+91 98111 55443",
    },
    {
      title: "Authentic Quranic Tafseer, Tajweed & Arabic Grammars",
      sponsorName: "Maktaba Darus Salam Publications",
      category: "ISLAMIC_BOOKS" as const,
      description: "Hardbound leather Quran translations, Sahih Al-Bukhari sets, and childrens Islamic storybook collections with free shipping.",
      imageUrl: "https://images.unsplash.com/photo-1609599006353-e529721557fc?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://example.com/islamic-books",
      location: "Pan-India",
      contactPhone: "+91 98100 88776",
    },
    {
      title: "Turkish Mosque Carpets & Professional Echo-Free Acoustics",
      sponsorName: "Al-Badr Mosque Supplies & Interior Engineering",
      category: "MOSQUE_SUPPLIES" as const,
      description: "High-density fire-retardant prayer carpets, digital prayer time clocks, line-array speakers, and wudu area anti-slip matting.",
      imageUrl: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://example.com/mosque-carpets",
      location: "Pan-India",
      contactPhone: "+91 98765 99887",
    },
    {
      title: "Al-Bake Genuine Mughlai & Arabic Culinary Catering",
      sponsorName: "Al-Bake Halal Caterers & Event Managers",
      category: "HALAL_FOOD" as const,
      description: "Specialized 100% Halal certified bulk catering for Nikkah ceremonies, Iftar gatherings, and community Waqf dinners.",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://example.com/halal-catering",
      location: "Delhi NCR",
      contactPhone: "+91 98111 22110",
    },
    {
      title: "Al-Noor Premium Arabic Thobes, Jubbas & Silk Abayas",
      sponsorName: "Al-Noor Islamic Couture & Apparel",
      category: "ISLAMIC_CLOTHING" as const,
      description: "Breathable cotton Omani thobes, designer embroidered abayas, prayer caps, and natural Saudi Attar perfumes.",
      imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80",
      targetUrl: "https://example.com/islamic-apparel",
      location: "Hyderabad / Pan-India",
      contactPhone: "+91 98490 33221",
    },
  ];

  for (const ad of adsData) {
    await prisma.communityAd.create({
      data: {
        title: ad.title,
        sponsorName: ad.sponsorName,
        category: ad.category,
        description: ad.description,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl,
        location: ad.location,
        contactPhone: ad.contactPhone,
        status: "APPROVED",
        impressionsCount: Math.floor(120 + Math.random() * 500),
        clicksCount: Math.floor(15 + Math.random() * 80),
      },
    });
  }

  console.log("✓ Seeded 5 MOsQuE Community Ads & Sponsors.");
}

seedAds()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
