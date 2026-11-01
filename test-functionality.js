const http = require('http');
const TEST_PORT = parseInt(process.env.PORT || '3002', 10);

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    if (!options.headers) options.headers = {};
    if (!options.headers['x-forwarded-for']) {
      options.headers['x-forwarded-for'] = `10.0.0.${Math.floor(Math.random() * 250) + 1}`;
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

async function runTests() {
  const results = [];
  const log = (name, passed, detail) => {
    results.push({ name, passed, detail });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} - ${detail}`);
  };

  try {
    // 1. Test Home Page
    const homeRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/',
      method: 'GET'
    });
    log('Home Page (/)', homeRes.statusCode === 200, `Status: ${homeRes.statusCode}`);

    // 2. Test Cities API
    const citiesRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/cities',
      method: 'GET'
    });
    const citiesJson = JSON.parse(citiesRes.data || '{}');
    const citiesList = citiesJson.cities || (Array.isArray(citiesJson) ? citiesJson : []);
    log('Cities API (/api/cities)', citiesRes.statusCode === 200 && citiesList.length > 0, `Returned ${citiesList.length} cities`);

    // 3. Test Masjids Page
    const masjidsPageRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/masjids',
      method: 'GET'
    });
    log('Masjids Page (/masjids)', masjidsPageRes.statusCode === 200, `Status: ${masjidsPageRes.statusCode}`);

    // 4. Test Donations API
    const donationsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/donations',
      method: 'GET'
    });
    log('Donations API (/api/donations)', donationsRes.statusCode === 200, `Status: ${donationsRes.statusCode}`);

    // 5. Test Announcements Page
    const announcementsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/announcements',
      method: 'GET'
    });
    log('Announcements Page (/announcements)', announcementsRes.statusCode === 200, `Status: ${announcementsRes.statusCode}`);

    // 6. Test Events Page
    const eventsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/events',
      method: 'GET'
    });
    log('Events Page (/events)', eventsRes.statusCode === 200, `Status: ${eventsRes.statusCode}`);

    // 7. Test Ads Buzz Page
    const adsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/ads-buzz',
      method: 'GET'
    });
    log('Ads Buzz Page (/ads-buzz)', adsRes.statusCode === 200, `Status: ${adsRes.statusCode}`);

    // 8. Test About & Contact
    const aboutRes = await request({ hostname: 'localhost', port: TEST_PORT, path: '/about', method: 'GET' });
    log('About Page (/about)', aboutRes.statusCode === 200, `Status: ${aboutRes.statusCode}`);

    const contactRes = await request({ hostname: 'localhost', port: TEST_PORT, path: '/contact', method: 'GET' });
    log('Contact Page (/contact)', contactRes.statusCode === 200, `Status: ${contactRes.statusCode}`);

    // 9. Test Auth Login (Super Admin)
    const superAdminLoginPayload = JSON.stringify({
      email: 'superadmin@mosque.org',
      password: 'admin123'
    });
    const superAdminLoginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(superAdminLoginPayload)
      }
    }, superAdminLoginPayload);
    const superAdminCookies = superAdminLoginRes.headers['set-cookie'] || [];
    const superAdminCookieHeader = superAdminCookies.map(c => c.split(';')[0]).join('; ');
    log('Super Admin Login (/api/auth/login)', superAdminLoginRes.statusCode === 200, `Status: ${superAdminLoginRes.statusCode}`);

    // 10. Test Auth Me with Super Admin Cookie
    const authMeRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Cookie': superAdminCookieHeader
      }
    });
    const authMeData = JSON.parse(authMeRes.data || '{}');
    log('Auth Me API (/api/auth/me)', authMeRes.statusCode === 200 && authMeData.user?.role === 'SUPER_ADMIN', `Role: ${authMeData.user?.role}`);

    // 11. Test Super Admin Data API
    const superAdminDataRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/super-admin/data',
      method: 'GET',
      headers: {
        'Cookie': superAdminCookieHeader
      }
    });
    log('Super Admin Data API (/api/super-admin/data)', superAdminDataRes.statusCode === 200, `Status: ${superAdminDataRes.statusCode}`);

    // 12. Test Super Admin Masjids API
    const superAdminMasjidsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/super-admin/masjids',
      method: 'GET',
      headers: {
        'Cookie': superAdminCookieHeader
      }
    });
    log('Super Admin Masjids API (/api/super-admin/masjids)', superAdminMasjidsRes.statusCode === 200, `Status: ${superAdminMasjidsRes.statusCode}`);

    // 13. Test Auth Login (Masjid Admin)
    const masjidAdminLoginPayload = JSON.stringify({
      email: 'admin.jama@mosque.org',
      password: 'admin123'
    });
    const masjidAdminLoginRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(masjidAdminLoginPayload)
      }
    }, masjidAdminLoginPayload);
    const masjidAdminCookies = masjidAdminLoginRes.headers['set-cookie'] || [];
    const masjidAdminCookieHeader = masjidAdminCookies.map(c => c.split(';')[0]).join('; ');
    log('Masjid Admin Login (/api/auth/login)', masjidAdminLoginRes.statusCode === 200, `Status: ${masjidAdminLoginRes.statusCode}`);

    // 14. Test Masjid Admin Dashboard API
    const masjidAdminDashRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/masjid-admin/dashboard',
      method: 'GET',
      headers: {
        'Cookie': masjidAdminCookieHeader
      }
    });
    log('Masjid Admin Dashboard API (/api/masjid-admin/dashboard)', masjidAdminDashRes.statusCode === 200, `Status: ${masjidAdminDashRes.statusCode}`);

    // 15. Test Masjid Admin Details API
    const masjidDetailsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/masjid-admin/details',
      method: 'GET',
      headers: {
        'Cookie': masjidAdminCookieHeader
      }
    });
    log('Masjid Admin Details API (/api/masjid-admin/details)', masjidDetailsRes.statusCode === 200, `Status: ${masjidDetailsRes.statusCode}`);

    // 16. Test Masjid Admin Staff API
    const masjidStaffRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/masjid-admin/staff',
      method: 'GET',
      headers: {
        'Cookie': masjidAdminCookieHeader
      }
    });
    log('Masjid Admin Staff API (/api/masjid-admin/staff)', masjidStaffRes.statusCode === 200, `Status: ${masjidStaffRes.statusCode}`);

    // 17. Test Masjid Admin Bank Accounts API
    const masjidBankRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/masjid-admin/bank-accounts',
      method: 'GET',
      headers: {
        'Cookie': masjidAdminCookieHeader
      }
    });
    log('Masjid Admin Bank Accounts API', masjidBankRes.statusCode === 200, `Status: ${masjidBankRes.statusCode}`);

    // 18. Test User Registration
    const testEmail = `testuser_${Date.now()}@example.com`;
    const registerPayload = JSON.stringify({
      name: 'Test Worshipper',
      email: testEmail,
      password: 'password123',
      phone: '+91 99999 88888'
    });
    const registerRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerPayload)
      }
    }, registerPayload);
    log('User Registration (/api/auth/register)', registerRes.statusCode === 200 || registerRes.statusCode === 201, `Status: ${registerRes.statusCode}`);

    // 19. Test Specific Masjid Page
    const singleMasjidRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/masjids/jama-masjid-old-delhi',
      method: 'GET'
    });
    log('Masjid Details Page (/masjids/jama-masjid-old-delhi)', singleMasjidRes.statusCode === 200, `Status: ${singleMasjidRes.statusCode}`);

    // 20. Test Finance Overview API
    const financeOverviewRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/finance/overview',
      method: 'GET',
      headers: {
        'Cookie': masjidAdminCookieHeader
      }
    });
    log('Finance Overview API (/api/finance/overview)', financeOverviewRes.statusCode === 200, `Status: ${financeOverviewRes.statusCode}`);

    // 21. Test Masjid Admin Announcements API
    const masjidAnnouncementsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/masjid-admin/announcements',
      method: 'GET',
      headers: {
        'Cookie': masjidAdminCookieHeader
      }
    });
    log('Masjid Admin Announcements API', masjidAnnouncementsRes.statusCode === 200, `Status: ${masjidAnnouncementsRes.statusCode}`);

    // 22. Test Masjid Admin Events API
    const masjidEventsRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/masjid-admin/events',
      method: 'GET',
      headers: {
        'Cookie': masjidAdminCookieHeader
      }
    });
    log('Masjid Admin Events API', masjidEventsRes.statusCode === 200, `Status: ${masjidEventsRes.statusCode}`);

    // 23. Test Super Admin RBAC API
    const superAdminRbacRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/super-admin/rbac',
      method: 'GET',
      headers: {
        'Cookie': superAdminCookieHeader
      }
    });
    log('Super Admin RBAC API (/api/super-admin/rbac)', superAdminRbacRes.statusCode === 200, `Status: ${superAdminRbacRes.statusCode}`);

    // 24. Test Super Admin Verifications API
    const superAdminVerifRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/super-admin/verifications',
      method: 'GET',
      headers: {
        'Cookie': superAdminCookieHeader
      }
    });
    log('Super Admin Verifications API', superAdminVerifRes.statusCode === 200, `Status: ${superAdminVerifRes.statusCode}`);

    // 25. Test Logout API
    const logoutRes = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Cookie': superAdminCookieHeader
      }
    });
    log('Logout API (/api/auth/logout)', logoutRes.statusCode === 200, `Status: ${logoutRes.statusCode}`);

    // Summary
    const totalPassed = results.filter(r => r.passed).length;
    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${totalPassed}/${results.length} PASSED`);
    console.log(`========================================`);

  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
