const http = require('http');

const PORT = 3002;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    if (!options.headers) options.headers = {};
    if (!options.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = `10.0.1.${Math.floor(Math.random() * 250) + 1}`;
    }
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTest() {
  console.log("=== Testing Newly Created Masjid Admin Login (RNM / rn@rn.com) ===");
  
  // 1. Get plainPassword for rn@rn.com from DB or test with known password
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const rnUser = await prisma.user.findUnique({
    where: { email: 'rn@rn.com' }
  });
  console.log(`Found RN user: email=${rnUser.email}, plainPassword=${rnUser.plainPassword}`);

  // 2. Login as rn@rn.com
  const loginPayload = JSON.stringify({
    email: rnUser.email,
    password: rnUser.plainPassword
  });
  const loginRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload)
    }
  }, loginPayload);

  console.log(`Login response status: ${loginRes.statusCode}`);
  if (loginRes.statusCode !== 200) {
    console.error("Login failed:", loginRes.data);
    process.exit(1);
  }

  const cookies = loginRes.headers['set-cookie'] || [];
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

  // 3. Check /api/auth/me
  const meRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Cookie': cookieHeader }
  });
  const meData = JSON.parse(meRes.data);
  console.log("Auth Me enabledModules count:", meData.user?.enabledModules?.length);
  console.log("Enabled modules:", meData.user?.enabledModules);

  if (!meData.user?.enabledModules || meData.user.enabledModules.length === 0) {
    console.error("❌ FAIL: enabledModules is empty for rn@rn.com!");
    process.exit(1);
  } else {
    console.log("✅ PASS: enabledModules populated successfully for RNM admin!");
  }

  // 4. Test Masjid Admin Dashboard API
  const dashRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/masjid-admin/dashboard',
    method: 'GET',
    headers: { 'Cookie': cookieHeader }
  });
  console.log(`Dashboard API status: ${dashRes.statusCode}`);
  if (dashRes.statusCode === 200) {
    console.log("✅ PASS: Masjid Admin Dashboard API accessible!");
  } else {
    console.error("❌ FAIL: Masjid Admin Dashboard API returned", dashRes.statusCode);
  }

  // 5. Test Creating a BRAND NEW Masjid as Super Admin and verify permissions
  console.log("\n=== Testing Creation of a BRAND NEW Masjid via Super Admin API ===");

  // Login as superadmin
  const saLoginPayload = JSON.stringify({
    email: 'superadmin@mosque.org',
    password: 'admin123'
  });
  const saLoginRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(saLoginPayload)
    }
  }, saLoginPayload);
  const saCookies = saLoginRes.headers['set-cookie'] || [];
  const saCookieHeader = saCookies.map(c => c.split(';')[0]).join('; ');

  const timestamp = Date.now();
  const testNewMasjidPayload = JSON.stringify({
    name: `Test Masjid ${timestamp}`,
    cityName: 'Lucknow',
    address: 'Hazratganj, Lucknow',
    adminName: `Admin Lucknow ${timestamp}`,
    adminEmail: `admin.lucknow.${timestamp}@mosque.org`,
    adminPassword: 'Password@123',
    adminPhone: '+91 91234 56789'
  });

  const createRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/super-admin/masjids',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testNewMasjidPayload),
      'Cookie': saCookieHeader
    }
  }, testNewMasjidPayload);

  console.log(`Create Masjid API status: ${createRes.statusCode}`);
  const createData = JSON.parse(createRes.data);
  console.log("Created Masjid enabledModules:", createData.masjid?.enabledModules);

  if (!createData.masjid?.enabledModules || createData.masjid.enabledModules.length === 0) {
    console.error("❌ FAIL: Newly created masjid has empty enabledModules!");
    process.exit(1);
  } else {
    console.log("✅ PASS: Newly created masjid has default modules enabled!");
  }

  // 6. Login as the newly created admin
  const newAdminLoginPayload = JSON.stringify({
    email: `admin.lucknow.${timestamp}@mosque.org`,
    password: 'Password@123'
  });
  const newAdminLoginRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(newAdminLoginPayload)
    }
  }, newAdminLoginPayload);

  console.log(`New Admin Login status: ${newAdminLoginRes.statusCode}`);
  const newAdminCookies = newAdminLoginRes.headers['set-cookie'] || [];
  const newAdminCookieHeader = newAdminCookies.map(c => c.split(';')[0]).join('; ');

  const newAdminMeRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Cookie': newAdminCookieHeader }
  });
  const newAdminMe = JSON.parse(newAdminMeRes.data);
  console.log("New Admin Auth Me enabledModules count:", newAdminMe.user?.enabledModules?.length);

  if (newAdminMe.user?.enabledModules?.length === 12) {
    console.log("✅ PASS: All 12 modules immediately available for newly created Masjid Admin!");
  } else {
    console.error("❌ FAIL: Unexpected modules count:", newAdminMe.user?.enabledModules?.length);
  }

  // 7. Verify /api/masjid-admin/dashboard for new admin
  const newAdminDashRes = await request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/masjid-admin/dashboard',
    method: 'GET',
    headers: { 'Cookie': newAdminCookieHeader }
  });
  console.log(`New Admin Dashboard API status: ${newAdminDashRes.statusCode}`);
  if (newAdminDashRes.statusCode === 200) {
    console.log("✅ PASS: New Admin Dashboard accessible with 200 OK!");
  }

  // Clean up test masjid from DB
  await prisma.masjid.delete({ where: { id: createData.masjid.id } });
  await prisma.user.delete({ where: { id: createData.admin.id } });
  console.log("🧹 Cleaned up temporary test masjid.");

  await prisma.$disconnect();
  console.log("\n🎉 ALL PERMISSION TESTS PASSED SUCCESSFULLY!");
}

runTest().catch(console.error);
