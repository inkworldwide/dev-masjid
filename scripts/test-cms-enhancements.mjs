import http from "node:http";

async function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json: () => {
            try {
              return JSON.parse(data);
            } catch (e) {
              return null;
            }
          },
        });
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function parseCookies(resHeaders) {
  const setCookie = resHeaders["set-cookie"];
  if (!setCookie) return "";
  return Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(";")[0]).join("; ")
    : setCookie.split(";")[0];
}

async function run() {
  console.log("=== CMS Enhancements Verification Suite ===");

  // 1. Log in as Masjid Admin
  console.log("\n1. Logging in as Masjid Admin (admin.jama@mosque.org)...");
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 3002,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { email: "admin.jama@mosque.org", password: "admin123" }
  );

  if (loginRes.statusCode !== 200) {
    console.error("Login failed:", loginRes.statusCode, loginRes.body);
    process.exit(1);
  }

  const cookie = parseCookies(loginRes.headers);
  console.log("✓ Logged in successfully. Cookie acquired.");

  // 2. Fetch current details
  console.log("\n2. Fetching current masjid details...");
  const getRes = await request({
    hostname: "localhost",
    port: 3002,
    path: "/api/masjid-admin/details",
    method: "GET",
    headers: { Cookie: cookie },
  });

  const getData = getRes.json();
  if (!getData?.masjid) {
    console.error("Failed to get masjid:", getRes.body);
    process.exit(1);
  }
  const masjidId = getData.masjid.id;
  console.log(`✓ Fetched masjid ID: ${masjidId} (${getData.masjid.name})`);

  // 3. Test Invalid URL validation
  console.log("\n3. Testing URL validation on Prayer Timing Link...");
  const invalidUrlRes = await request(
    {
      hostname: "localhost",
      port: 3002,
      path: "/api/masjid-admin/details",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
    },
    {
      prayerTimingLink: {
        url: "javascript:alert(1)",
        label: "Malicious Link",
        isActive: true,
      },
    }
  );
  if (invalidUrlRes.statusCode === 400) {
    console.log("✓ Rejected invalid URL correctly (HTTP 400).");
  } else {
    console.error("Expected HTTP 400 for invalid URL, got:", invalidUrlRes.statusCode, invalidUrlRes.body);
    process.exit(1);
  }

  // 4. Update all 3 sections with dynamic CMS data
  console.log("\n4. Updating Daily Iqamah Schedule, Surrounding Area & Landmarks, and Masjid Facilities...");
  const updatePayload = {
    dailyPrayers: [
      { id: "p1", name: "Fajr", time: "05:15 AM", isActive: true, order: 0 },
      { id: "p2", name: "Dhuhr", time: "01:30 PM", isActive: true, order: 1 },
      { id: "p3", name: "Asr", time: "05:00 PM", isActive: true, order: 2 },
      { id: "p4", name: "Maghrib", time: "07:15 PM", isActive: true, order: 3 },
      { id: "p5", name: "Isha", time: "08:45 PM", isActive: true, order: 4 },
      { id: "p6", name: "Jummah", time: "01:45 PM", isActive: true, order: 5 },
      { id: "p7", name: "Tahajjud", time: "04:00 AM", isActive: true, order: 6 },
    ],
    prayerTimingLink: {
      url: "https://example.com/mecca-masjid-prayer-times",
      label: "View Complete Prayer Timings",
      isActive: true,
    },
    surroundingDetails: {
      heading: "Surrounding Area & Landmarks",
      overviewLabel: "NEIGHBORHOOD OVERVIEW",
      overviewDesc: "Vibrant heritage quarter filled with traditional Hyderabadi Attar shops, Pearl bazaars, and legendary Biryani eateries.",
      landmarksLabel: "NEARBY LANDMARKS",
      landmarks: [
        { id: "lm1", name: "Charminar", distance: "100", unit: "m", isActive: true, order: 0 },
        { id: "lm2", name: "Chowmahalla Palace", distance: "400", unit: "m", isActive: true, order: 1 },
        { id: "lm3", name: "Laad Bazaar", distance: "150", unit: "m", isActive: true, order: 2 },
      ],
      link: {
        url: "https://telanganatourism.gov.in",
        label: "Explore Heritage Quarter",
        isActive: true,
      },
    },
    customFacilities: [
      { id: "f1", name: "Women's Prayer Area", isActive: true, order: 0 },
      { id: "f2", name: "Wudu Area", isActive: true, order: 1 },
      { id: "f3", name: "Parking", isActive: true, order: 2 },
      { id: "f4", name: "Quran Classes", isActive: true, order: 3 },
      { id: "f5", name: "Library", isActive: true, order: 4 },
      { id: "f6", name: "Wheelchair Access", isActive: true, order: 5 },
      { id: "f7", name: "Funeral Facilities", isActive: true, order: 6 },
    ],
  };

  const putRes = await request(
    {
      hostname: "localhost",
      port: 3002,
      path: "/api/masjid-admin/details",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
    },
    updatePayload
  );

  const putData = putRes.json();
  if (putRes.statusCode !== 200 || !putData?.success) {
    console.error("PUT failed:", putRes.statusCode, putRes.body);
    process.exit(1);
  }
  console.log("✓ Successfully updated details via PUT API.");

  // 5. Verify database persistence by reading back
  console.log("\n5. Verifying persistence via GET /api/masjid-admin/details...");
  const verifyGetRes = await request({
    hostname: "localhost",
    port: 3002,
    path: "/api/masjid-admin/details",
    method: "GET",
    headers: { Cookie: cookie },
  });
  const vData = verifyGetRes.json();
  const vMasjid = vData.masjid;

  if (vMasjid.dailyPrayers?.length !== 7) {
    console.error("Error: dailyPrayers count mismatch. Expected 7, got", vMasjid.dailyPrayers?.length);
    process.exit(1);
  }
  console.log("✓ dailyPrayers correctly persisted (7 prayers including Tahajjud).");

  if (!vMasjid.prayerTimingLink?.isActive || vMasjid.prayerTimingLink.url !== "https://example.com/mecca-masjid-prayer-times") {
    console.error("Error: prayerTimingLink mismatch:", vMasjid.prayerTimingLink);
    process.exit(1);
  }
  console.log("✓ prayerTimingLink correctly persisted.");

  if (vMasjid.surroundingDetails?.landmarks?.length !== 3) {
    console.error("Error: landmarks count mismatch:", vMasjid.surroundingDetails);
    process.exit(1);
  }
  console.log("✓ surroundingDetails correctly persisted (3 landmarks).");

  if (vMasjid.customFacilities?.length !== 7) {
    console.error("Error: customFacilities count mismatch:", vMasjid.customFacilities);
    process.exit(1);
  }
  console.log("✓ customFacilities correctly persisted (7 facilities).");

  // 6. Check Public Page HTML rendering
  console.log(`\n6. Fetching Public Page (/masjids/${masjidId})...`);
  const publicRes = await request({
    hostname: "localhost",
    port: 3002,
    path: `/masjids/${masjidId}`,
    method: "GET",
  });

  if (publicRes.statusCode !== 200) {
    console.error("Public page failed with code:", publicRes.statusCode);
    process.exit(1);
  }

  const html = publicRes.body;
  const assertions = [
    { name: "Tahajjud prayer in schedule", check: html.includes("Tahajjud") && html.includes("04:00 AM") },
    { name: "Jummah prayer in schedule", check: html.includes("Jummah") && html.includes("01:45 PM") },
    { name: "External prayer timing link", check: html.includes("https://example.com/mecca-masjid-prayer-times") },
    { name: "Surrounding Area heading", check: html.includes("Surrounding Area &amp; Landmarks") || html.includes("Surrounding Area & Landmarks") },
    { name: "Neighborhood Overview text", check: html.includes("Vibrant heritage quarter filled with traditional Hyderabadi Attar shops") },
    { name: "Nearby Landmarks formatted", check: html.includes("Charminar (100m)") && html.includes("Chowmahalla Palace (400m)") && html.includes("Laad Bazaar (150m)") },
    { name: "External area info link", check: html.includes("https://telanganatourism.gov.in") },
    { name: "Masjid Facilities heading", check: html.includes("Masjid Facilities") },
    { name: "Women's Prayer Area facility", check: html.includes("Women&#x27;s Prayer Area") || html.includes("Women's Prayer Area") },
    { name: "Wheelchair Access facility", check: html.includes("Wheelchair Access") },
    { name: "Funeral Facilities facility", check: html.includes("Funeral Facilities") },
  ];

  let allPassed = true;
  for (const a of assertions) {
    if (a.check) {
      console.log(`✓ ${a.name}`);
    } else {
      console.error(`✗ FAILED: ${a.name}`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    process.exit(1);
  }

  console.log("\n============================================");
  console.log("🎉 ALL CMS ENHANCEMENT TESTS PASSED 100%!");
  console.log("============================================");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
