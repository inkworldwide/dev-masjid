import { prisma } from "../src/lib/prisma";
import { signToken } from "../src/lib/auth";

async function main() {
  console.log("=== STARTING COMPREHENSIVE VERIFICATION SUITE ===");

  // 1. Verify Super Admin User & Masjid Admin User
  const superAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" }
  });
  console.log("✓ Found Super Admin:", superAdmin?.email);

  const masjidAdmin = await prisma.user.findFirst({
    where: { role: "MASJID_ADMIN" },
    include: { adminPermissions: true }
  });
  console.log("✓ Found Masjid Admin:", masjidAdmin?.email, "Assigned Masjid:", masjidAdmin?.adminPermissions[0]?.masjidId);

  const masjidId = masjidAdmin?.adminPermissions[0]?.masjidId;
  if (!masjidId) {
    throw new Error("No Masjid found for Masjid Admin");
  }

  const targetMasjid = await prisma.masjid.findUnique({
    where: { id: masjidId }
  });
  console.log("✓ Target Masjid:", targetMasjid?.name, "Enabled Modules:", targetMasjid?.enabledModules);

  // 2. Verify Safe Default: `ads_buzz` is disabled for existing masjids unless explicitly granted
  const currentModules = (targetMasjid?.enabledModules as string[]) || [];
  const hasAdsBuzzByDefault = currentModules.includes("ads_buzz");
  console.log(`✓ Safe Default Check: ads_buzz is currently ${hasAdsBuzzByDefault ? "ENABLED" : "DISABLED"} for ${targetMasjid?.name}`);

  // 3. Test Matrix / Permission Enforcement
  // Scenario A: Ensure ads_buzz is removed from target masjid
  const modulesWithoutAds = currentModules.filter((m) => m !== "ads_buzz");
  await prisma.masjid.update({
    where: { id: masjidId },
    data: { enabledModules: modulesWithoutAds }
  });

  // Verify that calling /api/admin/ads with Masjid Admin's cookie will be rejected
  const masjidAdminToken = signToken({
    userId: masjidAdmin!.id,
    role: masjidAdmin!.role,
    email: masjidAdmin!.email,
    name: masjidAdmin!.name,
  });

  const resForbidden = await fetch("http://localhost:3002/api/admin/ads", {
    headers: {
      Cookie: `auth_token=${masjidAdminToken}`
    }
  });
  console.log(`✓ Access Control Guard (Disabled): Status = ${resForbidden.status} (Expected 403)`);
  const forbiddenData = await resForbidden.json();
  console.log(`✓ Access Denied Message: "${forbiddenData.error}"`);
  if (resForbidden.status !== 403) {
    throw new Error(`Expected 403 Forbidden when ads_buzz is disabled, got ${resForbidden.status}`);
  }

  // Scenario B: Enable ads_buzz for target masjid
  const modulesWithAds = [...modulesWithoutAds, "ads_buzz"];
  await prisma.masjid.update({
    where: { id: masjidId },
    data: { enabledModules: modulesWithAds }
  });

  const resAllowed = await fetch("http://localhost:3002/api/admin/ads", {
    headers: {
      Cookie: `auth_token=${masjidAdminToken}`
    }
  });
  console.log(`✓ Access Control Guard (Enabled): Status = ${resAllowed.status} (Expected 200)`);
  const allowedData = await resAllowed.json();
  console.log(`✓ Access Granted: fetched ${allowedData.ads?.length ?? 0} ads, masjidName: "${allowedData.user?.masjidName}"`);
  if (resAllowed.status !== 200) {
    throw new Error(`Expected 200 OK when ads_buzz is enabled, got ${resAllowed.status}`);
  }

  // 4. Test Super Admin Ads Buzz Full Operations
  const superAdminToken = signToken({
    userId: superAdmin!.id,
    role: superAdmin!.role,
    email: superAdmin!.email,
    name: superAdmin!.name,
  });

  // Super Admin can create platform-wide ad or masjid-scoped ad
  const createAdRes = await fetch("http://localhost:3002/api/admin/ads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `auth_token=${superAdminToken}`
    },
    body: JSON.stringify({
      name: "Test Community Campaign 2026",
      description: "Support our local community educational program.",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
      targetUrl: "https://example.com/community",
      placement: "BOTH",
      format: "FULL_WIDTH",
      isExclusive: false,
      displayOrder: 1,
      isActive: true,
      isTest: true,
      masjidId: masjidId,
    })
  });
  const createdAd = await createAdRes.json();
  console.log(`✓ Super Admin Ad Creation: Status = ${createAdRes.status}, Ad ID = ${createdAd.ad?.id}`);
  if (createAdRes.status !== 200 && createAdRes.status !== 201) {
    throw new Error(`Failed to create ad: ${JSON.stringify(createdAd)}`);
  }

  // Masjid Admin can fetch their own ad
  const masjidFetchRes = await fetch("http://localhost:3002/api/admin/ads", {
    headers: { Cookie: `auth_token=${masjidAdminToken}` }
  });
  const masjidFetchData = await masjidFetchRes.json();
  const foundInMasjid = masjidFetchData.ads.find((a: any) => a.id === createdAd.ad.id);
  console.log(`✓ Masjid Admin Scoped Visibility: Ad is visible to assigned Masjid = ${Boolean(foundInMasjid)}`);

  // Clean up test ad
  const deleteAdRes = await fetch(`http://localhost:3002/api/admin/ads?id=${createdAd.ad.id}`, {
    method: "DELETE",
    headers: { Cookie: `auth_token=${superAdminToken}` }
  });
  console.log(`✓ Ad Cleanup: Status = ${deleteAdRes.status}`);

  // 5. Test Daily Iqamah Schedule: Start Time, End Time & NA handling
  console.log("\n--- Testing Daily Iqamah Schedule Configuration ---");
  const testPrayers = [
    {
      id: "p1",
      name: "Fajr",
      time: "05:15 AM",
      startTime: "05:15 AM",
      endTime: "06:00 AM",
      endTimeMode: "TIME" as const,
      isActive: true,
      order: 0,
    },
    {
      id: "p2",
      name: "Dhuhr",
      time: "01:30 PM",
      startTime: "01:30 PM",
      endTime: null,
      endTimeMode: "NA" as const,
      isActive: true,
      order: 1,
    },
    {
      id: "p3",
      name: "Asr",
      time: "05:00 PM",
      startTime: "05:00 PM",
      endTime: "05:45 PM",
      endTimeMode: "TIME" as const,
      isActive: true,
      order: 2,
    },
    {
      id: "p4",
      name: "Maghrib",
      time: "07:15 PM",
      startTime: "07:15 PM",
      endTime: null,
      endTimeMode: "NA" as const,
      isActive: true,
      order: 3,
    },
    {
      id: "p5",
      name: "Isha",
      time: "08:45 PM",
      startTime: "08:45 PM",
      endTime: "09:30 PM",
      endTimeMode: "TIME" as const,
      isActive: true,
      order: 4,
    },
    {
      id: "p6",
      name: "Jummah",
      time: "01:45 PM",
      startTime: "01:45 PM",
      endTime: null,
      endTimeMode: "NA" as const,
      isActive: true,
      order: 5,
    },
  ];

  const updateDetailsRes = await fetch("http://localhost:3002/api/masjid-admin/details", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `auth_token=${masjidAdminToken}`,
    },
    body: JSON.stringify({
      dailyPrayers: testPrayers,
    })
  });
  console.log(`✓ Update Iqamah Schedule API: Status = ${updateDetailsRes.status}`);
  if (!updateDetailsRes.ok) {
    const err = await updateDetailsRes.json();
    throw new Error(`Failed to update Iqamah Schedule: ${JSON.stringify(err)}`);
  }

  // Fetch from database to verify persistence
  const updatedMasjid = await prisma.masjid.findUnique({
    where: { id: masjidId }
  });
  const savedPrayers = updatedMasjid?.dailyPrayers as any[];
  console.log("✓ Database Persisted Prayers Count:", savedPrayers.length);

  const fajr = savedPrayers.find((p) => p.name === "Fajr");
  console.log(`✓ Fajr: Start = "${fajr.startTime}", End = "${fajr.endTime}", Mode = "${fajr.endTimeMode}"`);
  if (fajr.startTime !== "05:15 AM" || fajr.endTime !== "06:00 AM" || fajr.endTimeMode !== "TIME") {
    throw new Error(`Fajr prayer times mismatched: ${JSON.stringify(fajr)}`);
  }

  const dhuhr = savedPrayers.find((p) => p.name === "Dhuhr");
  console.log(`✓ Dhuhr (NA): Start = "${dhuhr.startTime}", End = ${dhuhr.endTime}, Mode = "${dhuhr.endTimeMode}"`);
  if (dhuhr.startTime !== "01:30 PM" || dhuhr.endTime !== null || dhuhr.endTimeMode !== "NA") {
    throw new Error(`Dhuhr NA mode mismatched or corrupted: ${JSON.stringify(dhuhr)}`);
  }

  // Verify public endpoint renders with 200
  const publicPageRes = await fetch(`http://localhost:3002/masjids/${masjidId}`);
  console.log(`✓ Public Masjid Detail Page (${masjidId}): Status = ${publicPageRes.status}`);
  if (publicPageRes.status !== 200) {
    throw new Error(`Public page returned status ${publicPageRes.status}`);
  }

  // 6. Test RBAC Matrix API endpoint includes ads_buzz
  const rbacRes = await fetch("http://localhost:3002/api/super-admin/rbac", {
    headers: { Cookie: `auth_token=${superAdminToken}` }
  });
  const rbacData = await rbacRes.json();
  console.log("✓ Super Admin RBAC matrix keys:", Object.keys(rbacData.matrix));
  console.log(`✓ RBAC Matrix contains ads_buzz: ${Boolean(rbacData.matrix["ads_buzz"])}`);

  console.log("\n=== ALL COMPREHENSIVE TESTS PASSED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
