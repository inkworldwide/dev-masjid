import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Starting MOsQuE realistic data seeding...");

  // 1. Password hash for demo accounts
  const passwordHash = await bcrypt.hash("admin123", 10);
  const userPasswordHash = await bcrypt.hash("user123", 10);

  // 2. Create Cities
  const citiesData = [
    { name: "New Delhi", slug: "new-delhi" },
    { name: "Deoband", slug: "deoband" },
    { name: "Srinagar", slug: "srinagar" },
    { name: "Hyderabad", slug: "hyderabad" },
    { name: "Kolkata", slug: "kolkata" },
    { name: "Bhopal", slug: "bhopal" },
  ];

  const citiesMap: Record<string, string> = {};
  for (const c of citiesData) {
    const createdCity = await prisma.city.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
    citiesMap[c.slug] = createdCity.id;
  }

  // 3. Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@mosque.org" },
    update: {
      name: "Global Mutawalli Council (Super Admin)",
      role: "SUPER_ADMIN",
      passwordHash,
      plainPassword: "admin123",
    },
    create: {
      customId: "SUP-001",
      email: "superadmin@mosque.org",
      name: "Global Mutawalli Council (Super Admin)",
      passwordHash,
      plainPassword: "admin123",
      role: "SUPER_ADMIN",
      phone: "+91 98765 00000",
      isEmailVerified: true,
      isApproved: true,
    },
  });
  console.log("✓ Super Admin created: superadmin@mosque.org");

  // 4. Create Masjid Admins & Masjids
  const masjidsData = [
    {
      name: "Jama Masjid Old Delhi",
      slug: "jama-masjid-old-delhi",
      citySlug: "new-delhi",
      location: "Chandni Chowk, Old Delhi",
      contactNumber: "+91 11 2326 2154",
      plotSize: "15,000 Sq Yards (135,000 Sq Ft)",
      registrationNo: "WAQF/DEL/1954/001",
      description: "Built by Mughal Emperor Shah Jahan between 1644 and 1656, Jama Masjid is one of the largest and most historic congregational mosques in India.",
      coverImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
      pictures: [
        "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80"
      ],
      videoTourUrl: "https://youtube.com/watch?v=demo-jama-masjid",
      surroundingAreaDesc: "Situated right in the heart of historic Old Delhi, surrounded by bustling Chandni Chowk bazaars, traditional Islamic bookshops, and heritage Mughal architecture.",
      nearbyLandmarks: "Red Fort (500m), Meena Bazaar (100m), Gurudwara Sis Ganj Sahib (400m)",
      facilities: ["Women's Prayer Area", "Wudu Area", "Parking", "Quran Classes", "Library", "Wheelchair Access", "Drinking Water", "Funeral Facilities"],
      busDistance: "150 meters from Daryaganj ISBT Bus Terminal",
      trainDistance: "1.2 km from Old Delhi Railway Station (DLI)",
      metroDistance: "250 meters from Chawri Bazar Metro Station (Yellow Line)",
      airportDistance: "18.5 km from Indira Gandhi International Airport (DEL)",
      address: "Jama Masjid Road, Daryaganj, Chawri Bazar",
      state: "Delhi",
      pincode: "110006",
      latitude: 28.6507,
      longitude: 77.2334,
      adminEmail: "admin.jama@mosque.org",
      adminName: "Haji Maulana Mufti Mukarram",
    },
    {
      name: "Masjid-e-Rasheed Deoband",
      slug: "masjid-e-rasheed-deoband",
      citySlug: "deoband",
      location: "Darul Uloom Campus, Deoband",
      contactNumber: "+91 1336 222 124",
      plotSize: "22,000 Sq Yards",
      registrationNo: "WAQF/UP/1988/441",
      description: "Located within the world-renowned Darul Uloom Deoband campus, featuring grand domes, white marble carvings, and housing thousands of students of Islamic theology.",
      coverImage: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
      pictures: [
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80"
      ],
      videoTourUrl: "https://youtube.com/watch?v=demo-deoband",
      surroundingAreaDesc: "Peaceful Islamic academic township surrounded by historic madrasas, Islamic libraries, and residential student quarters.",
      nearbyLandmarks: "Darul Uloom Main Library (50m), Khanqah-e-Mahmoodia (200m)",
      facilities: ["Wudu Area", "Quran Classes", "Library", "Community Hall", "Madrasa", "Drinking Water"],
      busDistance: "600 meters from Deoband Bus Depot",
      trainDistance: "1.8 km from Deoband Railway Station (DBD)",
      metroDistance: "N/A (Inter-city rail transport)",
      airportDistance: "145 km from Dehradun Jolly Grant Airport",
      address: "Darul Uloom Deoband Campus, Saharanpur District",
      state: "Uttar Pradesh",
      pincode: "247554",
      latitude: 29.6975,
      longitude: 77.5855,
      adminEmail: "admin.rasheed@mosque.org",
      adminName: "Maulana Qari Abul Qasim",
    },
    {
      name: "Hazratbal Shrine Srinagar",
      slug: "hazratbal-shrine-srinagar",
      citySlug: "srinagar",
      location: "Dal Lake Northern Bank, Srinagar",
      contactNumber: "+91 194 242 0981",
      plotSize: "18,500 Sq Yards",
      registrationNo: "JKW/SRN/1979/08",
      description: "Prism of white marble situated on the left bank of Dal Lake, revered for housing the sacred relic Moi-e-Muqqadas of Prophet Muhammad (PBUH).",
      coverImage: "https://images.unsplash.com/photo-1590076175571-4b5459efb08c?auto=format&fit=crop&w=1200&q=80",
      pictures: [
        "https://images.unsplash.com/photo-1590076175571-4b5459efb08c?auto=format&fit=crop&w=1200&q=80"
      ],
      videoTourUrl: "https://youtube.com/watch?v=demo-hazratbal",
      surroundingAreaDesc: "Lakeside precinct overlooking the serene Dal Lake and Zabarwan Mountain range with traditional Kashmiri wooden Shikaras.",
      nearbyLandmarks: "Nishat Bagh (3.5 km), Kashmir University Campus (400m)",
      facilities: ["Women's Prayer Area", "Wudu Area", "Parking", "Library", "Wheelchair Access", "Drinking Water"],
      busDistance: "300 meters from Hazratbal Bus Stop",
      trainDistance: "14 km from Srinagar Railway Station (SINA)",
      metroDistance: "N/A",
      airportDistance: "22 km from Sheikh ul-Alam International Airport (SXR)",
      address: "Hazratbal Road, University of Kashmir Campus, Srinagar",
      state: "Jammu and Kashmir",
      pincode: "190006",
      latitude: 34.1287,
      longitude: 74.8425,
      adminEmail: "admin.hazratbal@mosque.org",
      adminName: "Peer Farooq Ahmad Waqfi",
    },
    {
      name: "Mecca Masjid Hyderabad",
      slug: "mecca-masjid-hyderabad",
      citySlug: "hyderabad",
      location: "Charminar Road, Hyderabad",
      contactNumber: "+91 40 2452 3041",
      plotSize: "25,000 Sq Yards",
      registrationNo: "TSWAQF/HYD/1694/01",
      description: "One of India's largest mosques built using bricks made from soil brought directly from Mecca, located adjacent to the iconic Charminar.",
      coverImage: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
      pictures: [
        "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80"
      ],
      videoTourUrl: "https://youtube.com/watch?v=demo-mecca-masjid",
      surroundingAreaDesc: "Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.",
      nearbyLandmarks: "Charminar (100m), Chowmahalla Palace (400m), Laad Bazaar (150m)",
      facilities: ["Women's Prayer Area", "Wudu Area", "Parking", "Quran Classes", "Library", "Wheelchair Access", "Funeral Facilities"],
      busDistance: "100 meters from Charminar Bus Station",
      trainDistance: "3.2 km from Hyderabad Deccan Station (Nampally)",
      metroDistance: "1.5 km from MGBS Metro Station (Green Line)",
      airportDistance: "21 km from Rajiv Gandhi International Airport (HYD)",
      address: "Charminar Rd, Ghansi Bazaar, Hyderabad",
      state: "Telangana",
      pincode: "500002",
      latitude: 17.3616,
      longitude: 78.4735,
      adminEmail: "admin.mecca@mosque.org",
      adminName: "Nawab Mir Sultan Ali Khan",
    },
  ];

  for (const mData of masjidsData) {
    const cityId = citiesMap[mData.citySlug];

    // Create Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: mData.adminEmail },
      update: {
        name: mData.adminName,
        role: "MASJID_ADMIN",
        passwordHash,
        plainPassword: "admin123",
      },
      create: {
        customId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
        email: mData.adminEmail,
        name: mData.adminName,
        passwordHash,
        plainPassword: "admin123",
        role: "MASJID_ADMIN",
        phone: "+91 98765 11111",
        isEmailVerified: true,
        isApproved: true,
      },
    });

    // Create Masjid
    const masjid = await prisma.masjid.upsert({
      where: { slug: mData.slug },
      update: {
        name: mData.name,
        location: mData.location,
        contactNumber: mData.contactNumber,
        plotSize: mData.plotSize,
        registrationNo: mData.registrationNo,
        description: mData.description,
        coverImage: mData.coverImage,
        pictures: mData.pictures,
        facilities: mData.facilities,
        busDistance: mData.busDistance,
        trainDistance: mData.trainDistance,
        metroDistance: mData.metroDistance,
        airportDistance: mData.airportDistance,
      },
      create: {
        name: mData.name,
        slug: mData.slug,
        location: mData.location,
        contactNumber: mData.contactNumber,
        plotSize: mData.plotSize,
        registrationNo: mData.registrationNo,
        status: "VERIFIED",
        description: mData.description,
        coverImage: mData.coverImage,
        pictures: mData.pictures,
        videoTourUrl: mData.videoTourUrl,
        surroundingAreaDesc: mData.surroundingAreaDesc,
        nearbyLandmarks: mData.nearbyLandmarks,
        facilities: mData.facilities,
        busDistance: mData.busDistance,
        trainDistance: mData.trainDistance,
        metroDistance: mData.metroDistance,
        airportDistance: mData.airportDistance,
        address: mData.address,
        cityId,
        state: mData.state,
        pincode: mData.pincode,
        latitude: mData.latitude,
        longitude: mData.longitude,
      },
    });

    // Assign Permissions
    await prisma.masjidAdminPermission.upsert({
      where: {
        userId_masjidId: {
          userId: adminUser.id,
          masjidId: masjid.id,
        },
      },
      update: {
        canAccessMainPage: true,
        canAccessDocuments: true,
        canAccessDonations: true,
        canAccessRolesPermissions: true,
        canAccessProperties: true,
        canAccessTenants: true,
        canAccessMembers: true,
        canAccessStaff: true,
        canAccessEvents: true,
        canAccessAnnouncements: true,
      },
      create: {
        userId: adminUser.id,
        masjidId: masjid.id,
        canAccessMainPage: true,
        canAccessDocuments: true,
        canAccessDonations: true,
        canAccessRolesPermissions: true,
        canAccessProperties: true,
        canAccessTenants: true,
        canAccessMembers: true,
        canAccessStaff: true,
        canAccessEvents: true,
        canAccessAnnouncements: true,
      },
    });

    // Seed Staff Roles
    await prisma.masjidStaff.createMany({
      data: [
        { masjidId: masjid.id, name: `Imam Maulana ${mData.name.split(" ")[0]}`, role: "IMAM", contact: "+91 98765 22222" },
        { masjidId: masjid.id, name: "Qari Hafiz Ziauddin", role: "MUEZZIN", contact: "+91 98765 33333" },
        { masjidId: masjid.id, name: "Al-Haj Rashid Siddiqui", role: "MUTAWALLI", contact: "+91 98765 44444" },
        { masjidId: masjid.id, name: "Adv. Tariq Anwar", role: "LAWYER", contact: "+91 98765 55555" },
        { masjidId: masjid.id, name: "Mohd Shakeel Electrician", role: "ELECTRICIAN", contact: "+91 98765 66666" },
      ],
      skipDuplicates: true,
    });

    // Seed Documents (Public vs Private handwritten requirements)
    await prisma.masjidDocument.createMany({
      data: [
        {
          masjidId: masjid.id,
          title: "Official Waqf Board Registration Certificate",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          type: "Waqf Certificate",
          visibility: "PUBLIC",
          status: "VERIFIED",
          uploadedBy: adminUser.name,
          description: "Certified registration document issued by the Central Waqf Council of India.",
        },
        {
          masjidId: masjid.id,
          title: "Annual Financial Audit Report 2025-2026",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          type: "Audit Statement",
          visibility: "PRIVATE",
          status: "VERIFIED",
          uploadedBy: adminUser.name,
          description: "Internal financial compliance and audit details reserved for committee members.",
        },
        {
          masjidId: masjid.id,
          title: "Property & Land Title Deed",
          fileUrl: "https://pdfobject.com/pdf/sample.pdf",
          type: "Property Deed",
          visibility: "PRIVATE",
          status: "VERIFIED",
          uploadedBy: adminUser.name,
          description: "Original land ownership title deed and boundary mapping.",
        },
      ],
      skipDuplicates: true,
    });

    // Seed Property & Tenants (Handwritten requirements)
    const property = await prisma.masjidProperty.create({
      data: {
        masjidId: masjid.id,
        propertyCustomId: `PROP-${masjid.name.substring(0, 3).toUpperCase()}-01`,
        contactPhone: mData.contactNumber,
        location: `${mData.location} Commercial Complex`,
        documentUrl: "https://pdfobject.com/pdf/sample.pdf",
        monthlyRent: 45000.00,
        revenueTotal: 540000.00,
        status: "OCCUPIED",
        tenants: {
          create: [
            {
              tenantCustomId: `TNT-${Math.floor(1000 + Math.random() * 9000)}`,
              tenantName: "Al-Barakah Islamic Bookshop & Attar",
              contactPhone: "+91 98111 22334",
              tenantDocUrl: "https://pdfobject.com/pdf/sample.pdf",
              monthlyRent: 45000.00,
              status: "ACTIVE",
            },
          ],
        },
      },
    });

    // Seed Donation Campaigns
    const campaign = await prisma.donationCampaign.create({
      data: {
        masjidId: masjid.id,
        title: `${mData.name} General Welfare & Maintenance Fund`,
        purpose: "Covering monthly electricity utilities, carpet cleaning, wudu area maintenance, and Quranic study supplies.",
        category: "GENERAL_FUND",
        goalAmount: 250000.00,
        raisedAmount: 145000.00,
        status: "ACTIVE",
      },
    });

    // Seed Demo Donation Records
    await prisma.donationRecord.createMany({
      data: [
        {
          campaignId: campaign.id,
          donorName: "Brother Zayd Khan",
          donorEmail: "zayd@gmail.com",
          amount: 5000.00,
          paymentMethod: "DEMO_PAYMENT",
          receiptNumber: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          notes: "May Allah accept this humble Sadaqah.",
        },
        {
          campaignId: campaign.id,
          donorName: "Sister Aisha Rahman",
          donorEmail: "aisha@gmail.com",
          amount: 10000.00,
          paymentMethod: "DEMO_PAYMENT",
          receiptNumber: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          notes: "In memory of late grandparents.",
        },
      ],
      skipDuplicates: true,
    });

    // Seed Announcements
    await prisma.masjidAnnouncement.createMany({
      data: [
        {
          masjidId: masjid.id,
          title: "Special Jummah Bayan & Prayer Timings Update",
          category: "PRAYER",
          description: "Jummah Khutbah will commence at 01:15 PM sharp followed by Jama'at at 01:45 PM. All congregants are requested to perform Wudu at home.",
          isImportant: true,
        },
        {
          masjidId: masjid.id,
          title: "Free Community Medical Checkup & Blood Donation Camp",
          category: "COMMUNITY",
          description: "Organized by the Mosque Committee this Sunday from 09:00 AM to 02:00 PM in the annex hall. Qualified doctors will be present.",
          isImportant: false,
        },
      ],
      skipDuplicates: true,
    });

    // Seed Events
    await prisma.masjidEvent.createMany({
      data: [
        {
          masjidId: masjid.id,
          title: "Weekly Quranic Tafseer Circle by Senior Scholars",
          category: "QURANIC_CIRCLE",
          eventDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
          eventTime: "Every Saturday After Maghrib (07:15 PM)",
          location: "Main Prayer Hall",
          description: "Comprehensive commentary of Juz Amma focusing on spiritual lessons and daily moral guidance.",
          speakerName: "Maulana Mufti Mukarram",
        },
        {
          masjidId: masjid.id,
          title: "Youth Islamic Character & Leadership Workshop",
          category: "YOUTH_PROGRAM",
          eventDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
          eventTime: "Sunday 10:00 AM - 01:00 PM",
          location: "Mosque Conference Library",
          description: "Interactive session for high school & college students on balancing modern career ambitions with authentic Islamic ethics.",
          speakerName: "Adv. Tariq Anwar",
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✓ Seeded Masjid: ${mData.name}`);
  }

  // 5. Create Community Users
  const communityUsers = [
    { email: "user.tariq@gmail.com", name: "Tariq Mahmood", phone: "+91 98100 11223" },
    { email: "user.fatima@gmail.com", name: "Fatima Noor", phone: "+91 98100 44556" },
  ];

  for (const cu of communityUsers) {
    await prisma.user.upsert({
      where: { email: cu.email },
      update: { name: cu.name, role: "USER", passwordHash: userPasswordHash },
      create: {
        customId: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        email: cu.email,
        name: cu.name,
        passwordHash: userPasswordHash,
        plainPassword: "user123",
        role: "USER",
        phone: cu.phone,
        isEmailVerified: true,
        isApproved: true,
      },
    });
  }

  console.log("✓ Community Users created.");
  console.log("🎉 MOsQuE database seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
