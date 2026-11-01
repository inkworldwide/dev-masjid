const fs = require('fs');
const http = require('http');

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}`;

async function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
  });
}

async function login(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request(new URL('/api/auth/login', BASE_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'];
        resolve({ status: res.statusCode, data: JSON.parse(data || '{}'), cookies });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('   MOSQUE PLATFORM — MASJID ADMIN NAVIGATION REORG TEST SUITE   ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // =========================================================================
  // 1. AUTHENTICATION & SESSION VERIFICATION
  // =========================================================================
  console.log('--- 1. AUTHENTICATION & PERMISSIONS ---');
  const adminLogin = await login('admin.jama@mosque.org', 'admin123');
  assert(adminLogin.status === 200 && adminLogin.data.user, 'Masjid Admin login succeeds with status 200');
  const cookies = adminLogin.cookies ? adminLogin.cookies.map(c => c.split(';')[0]).join('; ') : '';
  const authHeaders = { Cookie: cookies };

  // =========================================================================
  // 2. HTTP ROUTE STATUS CHECKS (ALL PAGES RESPOND 200)
  // =========================================================================
  console.log('\n--- 2. HTTP ROUTE AVAILABILITY CHECKS ---');
  const routesToTest = [
    { path: '/masjid-admin', name: 'Dashboard Overview' },
    { path: '/admin/profile', name: 'My Profile' },
    { path: '/masjid-admin/masjid-setting', name: 'Masjid Setting (New Landing Page)' },
    { path: '/masjid-admin/activity-setting', name: 'Activity Setting (New Landing Page)' },
    { path: '/masjid-admin/assets-setting', name: 'Assets Setting (New Landing Page)' },
    { path: '/masjid-admin/masjid-details', name: 'Masjid Details (Child of Masjid Setting)' },
    { path: '/masjid-admin/members', name: 'Committee Members (Child of Masjid Setting)' },
    { path: '/masjid-admin/staff', name: 'Staff & Leadership (Child of Masjid Setting)' },
    { path: '/masjid-admin/roles', name: 'Roles/Permissions (Child of Masjid Setting)' },
    { path: '/masjid-admin/announcements', name: 'Announcements (Child of Activity Setting)' },
    { path: '/masjid-admin/events', name: 'Events & Classes (Child of Activity Setting)' },
    { path: '/masjid-admin/media', name: 'Media Gallery (Child of Activity Setting)' },
    { path: '/masjid-admin/documents', name: 'Documents/Assets (Child of Assets Setting)' },
    { path: '/masjid-admin/properties', name: 'Property & Tenants (Child of Assets Setting)' },
    { path: '/masjid-admin/donations', name: 'Donations & Campaigns (Direct Sidebar Module)' },
    { path: '/masjid-admin/finance', name: 'Financial (Direct Sidebar Module)' },
    { path: '/masjid-admin/finance/inflow', name: 'Financial -> Inflow Ledger (Submenu)' },
    { path: '/masjid-admin/finance/expenditures', name: 'Financial -> Expenditure (Submenu)' },
    { path: '/masjid-admin/finance/manual-audit', name: 'Financial -> Manual Audit (Submenu)' },
    { path: '/masjid-admin/users', name: 'Users List (Direct Sidebar Module)' },
    { path: '/masjid-admin/reports', name: 'Analytics & Reports (Direct Sidebar Module)' },
    { path: '/dashboard', name: 'Public Community Home' }
  ];

  for (const r of routesToTest) {
    const res = await get(r.path, authHeaders);
    assert(res.status === 200, `GET ${r.path} (${r.name}) returned HTTP 200`);
  }

  // =========================================================================
  // 3. SETTINGS LANDING PAGES CODEBASE & COMPONENT STRUCTURE
  // =========================================================================
  console.log('\n--- 3. SETTINGS LANDING PAGES VALIDATION ---');

  // 3.1 Masjid Setting Page
  const masjidSettingCode = fs.readFileSync('src/app/masjid-admin/masjid-setting/page.tsx', 'utf8');
  assert(masjidSettingCode.includes('AdminLayout'), 'Masjid Setting wraps with AdminLayout');
  assert(masjidSettingCode.includes('Masjid Setting'), 'Masjid Setting renders "Masjid Setting" title');
  assert(masjidSettingCode.includes('Masjid Details') && masjidSettingCode.includes('/masjid-admin/masjid-details'), 'Masjid Setting card 1 links to /masjid-admin/masjid-details');
  assert(masjidSettingCode.includes('Committee Members') && masjidSettingCode.includes('/masjid-admin/members'), 'Masjid Setting card 2 links to /masjid-admin/members');
  assert(masjidSettingCode.includes('Staff & Leadership') && masjidSettingCode.includes('/masjid-admin/staff'), 'Masjid Setting card 3 links to /masjid-admin/staff');
  assert(masjidSettingCode.includes('Roles/Permissions') && masjidSettingCode.includes('/masjid-admin/roles'), 'Masjid Setting card 4 links to /masjid-admin/roles');
  assert(masjidSettingCode.includes('Mosque Profile & Details'), 'Masjid Setting card displays "Mosque Profile & Details"');
  assert(masjidSettingCode.includes('Committee Members Directory'), 'Masjid Setting card displays "Committee Members Directory"');
  assert(masjidSettingCode.includes('Masjid Leadership & Staff Roles'), 'Masjid Setting card displays "Masjid Leadership & Staff Roles"');
  assert(masjidSettingCode.includes('Role & Permission Matrix (RBAC)'), 'Masjid Setting card displays "Role & Permission Matrix (RBAC)"');

  // 3.2 Activity Setting Page
  const activitySettingCode = fs.readFileSync('src/app/masjid-admin/activity-setting/page.tsx', 'utf8');
  assert(activitySettingCode.includes('AdminLayout'), 'Activity Setting wraps with AdminLayout');
  assert(activitySettingCode.includes('Activity Setting'), 'Activity Setting renders "Activity Setting" title');
  assert(activitySettingCode.includes('Announcements') && activitySettingCode.includes('/masjid-admin/announcements'), 'Activity Setting card 1 links to /masjid-admin/announcements');
  assert(activitySettingCode.includes('Events & Classes') && activitySettingCode.includes('/masjid-admin/events'), 'Activity Setting card 2 links to /masjid-admin/events');
  assert(activitySettingCode.includes('Media Gallery') && activitySettingCode.includes('/masjid-admin/media'), 'Activity Setting card 3 links to /masjid-admin/media');
  assert(activitySettingCode.includes('Public Notices & Announcements'), 'Activity Setting card displays "Public Notices & Announcements"');
  assert(activitySettingCode.includes('Events & Quranic Circles'), 'Activity Setting card displays "Events & Quranic Circles"');
  assert(activitySettingCode.includes('Media Gallery & Video Tours'), 'Activity Setting card displays "Media Gallery & Video Tours"');

  // 3.3 Assets Setting Page
  const assetsSettingCode = fs.readFileSync('src/app/masjid-admin/assets-setting/page.tsx', 'utf8');
  assert(assetsSettingCode.includes('AdminLayout'), 'Assets Setting wraps with AdminLayout');
  assert(assetsSettingCode.includes('Assets Setting'), 'Assets Setting renders "Assets Setting" title');
  assert(assetsSettingCode.includes('Documents/Assets') && assetsSettingCode.includes('/masjid-admin/documents'), 'Assets Setting card 1 links to /masjid-admin/documents');
  assert(assetsSettingCode.includes('Property & Tenants') && assetsSettingCode.includes('/masjid-admin/properties'), 'Assets Setting card 2 links to /masjid-admin/properties');
  assert(assetsSettingCode.includes('Masjid Documents & Assets'), 'Assets Setting card displays "Masjid Documents & Assets"');
  assert(assetsSettingCode.includes('Waqf Property & Tenant Management'), 'Assets Setting card displays "Waqf Property & Tenant Management"');

  // =========================================================================
  // 4. CHILD PAGE HEADINGS VERIFICATION
  // =========================================================================
  console.log('\n--- 4. CHILD MODULE PAGE HEADINGS VALIDATION ---');
  const detailsCode = fs.readFileSync('src/app/masjid-admin/masjid-details/page.tsx', 'utf8');
  assert(detailsCode.includes('Mosque Profile & Details'), 'masjid-details/page.tsx renders heading "Mosque Profile & Details"');

  const membersCode = fs.readFileSync('src/app/masjid-admin/members/page.tsx', 'utf8');
  assert(membersCode.includes('Committee Members Directory'), 'members/page.tsx renders heading "Committee Members Directory"');

  const staffCode = fs.readFileSync('src/app/masjid-admin/staff/page.tsx', 'utf8');
  assert(staffCode.includes('Masjid Leadership & Staff Roles'), 'staff/page.tsx renders heading "Masjid Leadership & Staff Roles"');

  const rolesCode = fs.readFileSync('src/app/masjid-admin/roles/page.tsx', 'utf8');
  assert(rolesCode.includes('Role & Permission Matrix (RBAC)'), 'roles/page.tsx renders heading "Role & Permission Matrix (RBAC)"');

  const announcementsCode = fs.readFileSync('src/app/masjid-admin/announcements/page.tsx', 'utf8');
  assert(announcementsCode.includes('Public Notices & Announcements'), 'announcements/page.tsx renders heading "Public Notices & Announcements"');

  const eventsCode = fs.readFileSync('src/app/masjid-admin/events/page.tsx', 'utf8');
  assert(eventsCode.includes('Events & Quranic Circles'), 'events/page.tsx renders heading "Events & Quranic Circles"');

  const mediaCode = fs.readFileSync('src/app/masjid-admin/media/page.tsx', 'utf8');
  assert(mediaCode.includes('Media Gallery & Video Tours'), 'media/page.tsx renders heading "Media Gallery & Video Tours"');

  const documentsCode = fs.readFileSync('src/app/masjid-admin/documents/page.tsx', 'utf8');
  assert(documentsCode.includes('Masjid Documents & Assets'), 'documents/page.tsx renders heading "Masjid Documents & Assets"');

  const propertiesCode = fs.readFileSync('src/app/masjid-admin/properties/page.tsx', 'utf8');
  assert(propertiesCode.includes('Waqf Property & Tenant Management'), 'properties/page.tsx renders heading "Waqf Property & Tenant Management"');

  // =========================================================================
  // 5. SIDEBAR REORGANIZATION & ORDERING IN layout.tsx
  // =========================================================================
  console.log('\n--- 5. SIDEBAR ORDERING & ACTIVE HIGHLIGHTING VALIDATION ---');
  const layoutCode = fs.readFileSync('src/app/admin/layout.tsx', 'utf8');

  // Extract masjidAdminMenuFull array
  const menuFullMatch = layoutCode.match(/const masjidAdminMenuFull = (\[[\s\S]*?\]);/);
  assert(menuFullMatch !== null, 'masjidAdminMenuFull array found in layout.tsx');

  // Extract menu items from masjidAdminMenuFull
  const itemsRegex = /{\s*name:\s*"([^"]+)",\s*path:\s*"([^"]+)"/g;
  const menuItems = [];
  let m;
  const menuFullBlock = menuFullMatch[1];
  while ((m = itemsRegex.exec(menuFullBlock)) !== null) {
    menuItems.push({ name: m[1], path: m[2] });
  }

  const expectedOrder = [
    { name: "Dashboard Overview", path: "/masjid-admin" },
    { name: "My Profile", path: "/admin/profile" },
    { name: "Masjid Setting", path: "/masjid-admin/masjid-setting" },
    { name: "Activity Setting", path: "/masjid-admin/activity-setting" },
    { name: "Assets Setting", path: "/masjid-admin/assets-setting" },
    { name: "Donations & Campaigns", path: "/masjid-admin/donations" },
    { name: "Financial", path: "/masjid-admin/finance" },
    { name: "Users List", path: "/masjid-admin/users" },
    { name: "Analytics & Reports", path: "/masjid-admin/reports" },
  ];

  assert(menuItems.length === expectedOrder.length, `Sidebar has exactly ${expectedOrder.length} direct menu items (found ${menuItems.length})`);

  expectedOrder.forEach((expected, idx) => {
    const actual = menuItems[idx];
    assert(
      actual && actual.name === expected.name && actual.path === expected.path,
      `Item #${idx + 1} is "${expected.name}" (${expected.path})`
    );
  });

  // Verify child items are NOT in masjidAdminMenuFull
  const childPaths = [
    "/masjid-admin/masjid-details",
    "/masjid-admin/members",
    "/masjid-admin/staff",
    "/masjid-admin/roles",
    "/masjid-admin/announcements",
    "/masjid-admin/events",
    "/masjid-admin/media",
    "/masjid-admin/documents",
    "/masjid-admin/properties"
  ];
  childPaths.forEach((cp) => {
    assert(!menuItems.some(m => m.path === cp), `Child module "${cp}" is NOT a duplicate top-level sidebar item`);
  });

  // Verify getIsActive logic
  assert(layoutCode.includes('getIsActive'), 'getIsActive helper function present in layout.tsx');
  assert(layoutCode.includes('/masjid-admin/masjid-details') && layoutCode.includes('/masjid-admin/members'), 'getIsActive maps Masjid Setting child routes');
  assert(layoutCode.includes('/masjid-admin/announcements') && layoutCode.includes('/masjid-admin/events'), 'getIsActive maps Activity Setting child routes');
  assert(layoutCode.includes('/masjid-admin/documents') && layoutCode.includes('/masjid-admin/properties'), 'getIsActive maps Assets Setting child routes');

  // Verify Financial submenus
  assert(layoutCode.includes('1. Inflow Ledger') && layoutCode.includes('/inflow'), 'Financial submenu 1 "1. Inflow Ledger" preserved');
  assert(layoutCode.includes('2. Expenditure') && layoutCode.includes('/expenditures'), 'Financial submenu 2 "2. Expenditure" preserved');
  assert(layoutCode.includes('3. Manual Audit') && layoutCode.includes('/manual-audit'), 'Financial submenu 3 "3. Manual Audit" preserved');

  // Verify Public Community Home
  assert(layoutCode.includes('Public Community Home'), 'Public Community Home action preserved at the bottom');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`TOTAL TESTS PASSED: ${passed}`);
  console.log(`TOTAL TESTS FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
