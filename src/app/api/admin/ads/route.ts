import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const DUMMY_AD_PRESETS = [
  {
    name: "Al-Haramain Hajj & Umrah Travel Packages 2026",
    description: "Executive 5-star packages with direct flights, luxury hotels near Haram, and scholar-guided ziyarah.",
    imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/hajj-umrah",
    placement: "BOTH" as const,
    format: "FULL_WIDTH" as const,
  },
  {
    name: "Darussalam Islamic Book Store & Quran Publications",
    description: "Authentic Quran prints with Tajweed, Sahih Hadith collections, and children's Islamic learning literature.",
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/islamic-books",
    placement: "HOME_ONLY" as const,
    format: "FULL_WIDTH" as const,
  },
  {
    name: "Sultan Mosque Carpets & Acoustic Sound Engineering",
    description: "High-density Turkish prayer carpets, mihrab acoustic panelling, and interference-free wireless prayer audio systems.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/mosque-supplies",
    placement: "BOTH" as const,
    format: "HALF_WIDTH" as const,
  },
  {
    name: "Al-Madina Halal Catering & Community Kitchens",
    description: "Hygienic Nikah catering, Walima dining setups, Ramadan Iftar arrangements, and charity food drives.",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/halal-catering",
    placement: "BOTH" as const,
    format: "HALF_WIDTH" as const,
  },
  {
    name: "Noor Educational Madrasa & Arabic Academy",
    description: "Online & campus Quran memorization (Hifz), Tajweed certification, and modern Islamic Arabic language diplomas.",
    imageUrl: "https://images.unsplash.com/photo-1584281722572-8a96435c2b03?auto=format&fit=crop&w=800&q=80",
    targetUrl: "https://example.com/madrasa-academy",
    placement: "INNER_ONLY" as const,
    format: "QUAD_GRID" as const,
  },
];

async function verifyAdsBuzzAccess(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return { error: "Unauthorized. Please log in.", status: 401 };
  }

  if (user.role === "SUPER_ADMIN") {
    return { user, isSuperAdmin: true, targetMasjidId: null };
  }

  if (user.role !== "MASJID_ADMIN") {
    return { error: "Forbidden. Administrative access required.", status: 403 };
  }

  // Find assigned Masjid
  const permission = await prisma.masjidAdminPermission.findFirst({
    where: { userId: user.id },
    include: { masjid: { select: { id: true, name: true, enabledModules: true } } },
  });

  const masjid = permission?.masjid;
  if (!masjid) {
    return { error: "Forbidden: No assigned Masjid found for this administrator.", status: 403 };
  }

  const enabledModules = (masjid.enabledModules as string[]) || [];
  if (!enabledModules.includes("ads_buzz")) {
    return { error: "Access Denied: Ads Buzz module is not enabled for your Masjid.", status: 403 };
  }

  return { user, isSuperAdmin: false, targetMasjidId: masjid.id, masjidName: masjid.name };
}

export async function GET(req: Request) {
  try {
    const auth = await verifyAdsBuzzAccess(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const filterMasjidId = searchParams.get("masjidId");

    let where: any = {};

    if (auth.isSuperAdmin) {
      if (filterMasjidId && filterMasjidId !== "ALL") {
        if (filterMasjidId === "GLOBAL") {
          where.masjidId = null;
        } else {
          where.masjidId = filterMasjidId;
        }
      }
    } else {
      // Scoped to the Masjid Admin's masjid, plus platform-wide ads
      where.OR = [
        { masjidId: auth.targetMasjidId },
        { masjidId: null }
      ];
    }

    const ads = await prisma.advertisement.findMany({
      where,
      include: {
        masjid: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: [{ isExclusive: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    const testModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "ads_test_mode" },
    });
    const isTestMode = testModeSetting?.value === "true";

    // Mark whether the user has edit permissions on each ad
    const processedAds = ads.map((ad) => ({
      ...ad,
      isPlatformWide: !ad.masjidId,
      canEdit: auth.isSuperAdmin || ad.masjidId === auth.targetMasjidId,
    }));

    // If Super Admin, also return list of masjids for filtering
    let masjidsList: any[] = [];
    if (auth.isSuperAdmin) {
      masjidsList = await prisma.masjid.findMany({
        select: { id: true, name: true, location: true },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({
      ads: processedAds,
      testMode: isTestMode,
      isSuperAdmin: auth.isSuperAdmin,
      masjidScope: auth.targetMasjidId || null,
      masjidName: auth.masjidName || null,
      masjidsList,
    });
  } catch (error) {
    console.error("Fetch ads error:", error);
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAdsBuzzAccess(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { action } = body;

    // ── ACTION: TOGGLE TEST MODE ──
    if (action === "toggleTestMode") {
      const { enabled } = body;
      const updatedSetting = await prisma.systemSetting.upsert({
        where: { key: "ads_test_mode" },
        update: { value: enabled ? "true" : "false" },
        create: { key: "ads_test_mode", value: enabled ? "true" : "false" },
      });
      revalidatePath("/");
      return NextResponse.json({ 
        message: `Ads test mode ${enabled ? "enabled" : "disabled"}`, 
        testMode: updatedSetting.value === "true" 
      });
    }

    // ── ACTION: CREATE DUMMY / TEST AD ──
    if (action === "createDummyAd") {
      const { presetIndex, name, description, imageUrl, targetUrl, placement, format, isExclusive, isTest, masjidId } = body;
      const idx = typeof presetIndex === "number" ? presetIndex : 0;
      const preset = DUMMY_AD_PRESETS[idx % DUMMY_AD_PRESETS.length];

      // Check current test mode
      const testModeSetting = await prisma.systemSetting.findUnique({
        where: { key: "ads_test_mode" },
      });
      const currentTestMode = testModeSetting?.value === "true";
      const targetIsTest = isTest !== undefined ? Boolean(isTest) : currentTestMode;

      const targetMasjid = auth.isSuperAdmin ? (masjidId || null) : auth.targetMasjidId;

      const count = await prisma.advertisement.count({
        where: targetMasjid ? { masjidId: targetMasjid } : {},
      });

      const dummyAd = await prisma.advertisement.create({
        data: {
          masjidId: targetMasjid,
          name: name || preset.name,
          description: description || preset.description,
          imageUrl: imageUrl || preset.imageUrl,
          targetUrl: targetUrl || preset.targetUrl,
          placement: placement || preset.placement,
          format: format || preset.format,
          isExclusive: Boolean(isExclusive),
          isTest: targetIsTest,
          isActive: true,
          displayOrder: count + 1,
        },
      });

      revalidatePath("/");
      return NextResponse.json({ 
        message: targetIsTest 
          ? "Test ad created (visible when Test Mode is ON)" 
          : "Live ad created successfully (visible on website)", 
        ad: dummyAd 
      });
    }

    // ── ACTION: SEED DEFAULT CAMPAIGNS (5 Standard Ads) ──
    if (action === "seedDefaultCampaigns") {
      const targetMasjid = auth.isSuperAdmin ? (body.masjidId || null) : auth.targetMasjidId;

      const seeded = [];
      for (let i = 0; i < DUMMY_AD_PRESETS.length; i++) {
        const p = DUMMY_AD_PRESETS[i];
        const existing = await prisma.advertisement.findFirst({
          where: {
            name: p.name,
            masjidId: targetMasjid,
          },
        });
        if (!existing) {
          const created = await prisma.advertisement.create({
            data: {
              masjidId: targetMasjid,
              name: p.name,
              description: p.description,
              imageUrl: p.imageUrl,
              targetUrl: p.targetUrl,
              placement: p.placement,
              format: p.format,
              isExclusive: false,
              isActive: true,
              isTest: false,
              displayOrder: i + 1,
            },
          });
          seeded.push(created);
        }
      }

      revalidatePath("/");
      return NextResponse.json({ 
        message: `Successfully seeded ${seeded.length} standard live campaigns.`, 
        seededCount: seeded.length 
      });
    }

    // ── ACTION: TOGGLE ALL TEST ADS ──
    if (action === "toggleAllTestAds") {
      const { activate } = body;
      const whereCondition: any = { isTest: true };
      if (!auth.isSuperAdmin) {
        whereCondition.masjidId = auth.targetMasjidId;
      }
      await prisma.advertisement.updateMany({
        where: whereCondition,
        data: { isActive: Boolean(activate) },
      });
      revalidatePath("/");
      return NextResponse.json({ message: `All test ads ${activate ? "activated" : "deactivated"}` });
    }

    // ── ACTION: RESET TEST DATA ──
    if (action === "resetTestData") {
      const whereCondition: any = { isTest: true };
      if (!auth.isSuperAdmin) {
        whereCondition.masjidId = auth.targetMasjidId;
      }
      const deleted = await prisma.advertisement.deleteMany({
        where: whereCondition,
      });
      revalidatePath("/");
      return NextResponse.json({ message: `Deleted ${deleted.count} test advertisement(s). Real campaigns safely preserved.` });
    }

    // ── STANDARD CREATE AD BANNER ──
    const { name, description, imageUrl, targetUrl, placement, format, isExclusive, displayOrder, isActive, isTest, masjidId } = body;

    if (!name || !imageUrl || !targetUrl) {
      return NextResponse.json({ error: "Name, Image URL, and Target URL are required." }, { status: 400 });
    }

    const assignedMasjidId = auth.isSuperAdmin ? (masjidId || null) : auth.targetMasjidId;

    const count = await prisma.advertisement.count({
      where: assignedMasjidId ? { masjidId: assignedMasjidId } : {},
    });

    const parsedOrder = parseInt(String(displayOrder), 10);

    const cleanPlacement =
      placement === "HOME_ONLY"
        ? "HOME_ONLY"
        : placement === "INNER_ONLY" || placement === "PROPERTIES_ONLY" || placement === "PROPERTY_DETAIL_ONLY"
        ? "INNER_ONLY"
        : "BOTH";

    const newAd = await prisma.advertisement.create({
      data: {
        masjidId: assignedMasjidId,
        name,
        description: description || null,
        imageUrl,
        targetUrl,
        placement: cleanPlacement,
        format: format || "FULL_WIDTH",
        isExclusive: Boolean(isExclusive),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isTest: Boolean(isTest),
        displayOrder: isNaN(parsedOrder) || parsedOrder < 1 ? count + 1 : parsedOrder,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, ad: newAd });
  } catch (error) {
    console.error("Create ad error:", error);
    return NextResponse.json({ error: "Failed to create advertisement" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifyAdsBuzzAccess(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id, name, description, imageUrl, targetUrl, placement, format, isExclusive, displayOrder, isActive, isTest, masjidId } = body;

    if (!id) {
      return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
    }

    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
    }

    // Ownership Enforcement
    if (!auth.isSuperAdmin) {
      if (!existingAd.masjidId || existingAd.masjidId !== auth.targetMasjidId) {
        return NextResponse.json(
          { error: "Forbidden: You cannot modify platform-wide campaigns or advertisements belonging to another Masjid." },
          { status: 403 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (placement !== undefined) {
      updateData.placement =
        placement === "HOME_ONLY"
          ? "HOME_ONLY"
          : placement === "INNER_ONLY" || placement === "PROPERTIES_ONLY" || placement === "PROPERTY_DETAIL_ONLY"
          ? "INNER_ONLY"
          : "BOTH";
    }
    if (format !== undefined) updateData.format = format;
    if (isExclusive !== undefined) updateData.isExclusive = Boolean(isExclusive);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isTest !== undefined) updateData.isTest = Boolean(isTest);
    if (displayOrder !== undefined) {
      const parsed = parseInt(String(displayOrder), 10);
      updateData.displayOrder = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }
    if (auth.isSuperAdmin && masjidId !== undefined) {
      updateData.masjidId = masjidId || null;
    }

    const updatedAd = await prisma.advertisement.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error) {
    console.error("Update ad error:", error);
    return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await verifyAdsBuzzAccess(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
    }

    const existingAd = await prisma.advertisement.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
    }

    // Ownership Enforcement
    if (!auth.isSuperAdmin) {
      if (!existingAd.masjidId || existingAd.masjidId !== auth.targetMasjidId) {
        return NextResponse.json(
          { error: "Forbidden: You cannot delete platform-wide campaigns or advertisements belonging to another Masjid." },
          { status: 403 }
        );
      }
    }

    await prisma.advertisement.delete({
      where: { id },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Advertisement successfully deleted." });
  } catch (error) {
    console.error("Delete ad error:", error);
    return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
  }
}
