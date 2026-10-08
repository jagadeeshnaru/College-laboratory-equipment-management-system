// Automated Test Suite for College Laboratory Equipment Management System (Lab EMS)

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Helper to make HTTP requests
function apiCall(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Lab EMS REST API Automated Test Suite');
  console.log('====================================================\n');

  try {
    // 1. Health Check
    console.log('1. Testing System Health API:');
    const health = await apiCall('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health endpoint returns 200 OK and online status');

    // 2. Authentication
    console.log('\n2. Testing Authentication APIs:');
    const adminLogin = await apiCall('POST', '/api/auth/login', { username: 'admin', password: 'admin123', role: 'Admin' });
    assert(adminLogin.status === 200 && adminLogin.body.success === true, 'Admin login succeeds with valid credentials');

    const facultyLogin = await apiCall('POST', '/api/auth/login', { username: 'faculty1', password: 'faculty123', role: 'Faculty' });
    assert(facultyLogin.status === 200 && facultyLogin.body.user.role === 'Faculty', 'Faculty login succeeds with username faculty1');

    const badLogin = await apiCall('POST', '/api/auth/login', { username: 'admin', password: 'wrongpassword' });
    assert(badLogin.status === 401 && badLogin.body.success === false, 'Invalid credentials rejected with 401 Unauthorized');

    // 3. Equipment CRUD & Filter
    console.log('\n3. Testing Equipment Management & Filters:');
    const eqList = await apiCall('GET', '/api/equipment');
    assert(eqList.status === 200 && Array.isArray(eqList.body.data) && eqList.body.data.length > 0, 'Fetch equipment list returns array of items');

    const searchRes = await apiCall('GET', '/api/equipment?search=Dell');
    assert(searchRes.status === 200 && searchRes.body.data.every(e => e.name.toLowerCase().includes('dell') || e.description.toLowerCase().includes('dell')), 'Search filter by keyword returns matching records');

    const createEq = await apiCall('POST', '/api/equipment', {
      name: 'Raspberry Pi 4 Model B',
      category_id: 3,
      lab_id: 1,
      status: 'Available',
      purchase_date: '2024-09-01',
      warranty: '2 Years',
      description: 'Single board computer for IoT & Embedded systems laboratory.'
    });
    assert(createEq.status === 201 && createEq.body.success === true, 'Create new equipment succeeds with 201 Created');
    const newEqId = createEq.body.data.equipment_id;

    // 4. Equipment Allocations
    console.log('\n4. Testing Equipment Allocation & Return:');
    const allocRes = await apiCall('POST', '/api/allocations', {
      equipment_id: newEqId,
      allocated_to_name: 'Dr. Ramesh Kumar',
      allocated_to_role: 'Faculty',
      department: 'CSE',
      from_date: '2026-10-01',
      to_date: '2026-10-15',
      purpose: 'IoT Gateway Capstone Experiment'
    });
    assert(allocRes.status === 201 && allocRes.body.data.status === 'Active', 'Allocate equipment creates Active allocation record');

    // Verify equipment status changed to 'In Use'
    const eqCheck1 = await apiCall('GET', `/api/equipment/${newEqId}`);
    assert(eqCheck1.body.data.status === 'In Use', "Allocated equipment status dynamically transitions to 'In Use'");

    // Return equipment
    const allocId = allocRes.body.data.allocation_id;
    const returnRes = await apiCall('PUT', `/api/allocations/${allocId}/return`);
    assert(returnRes.status === 200 && returnRes.body.success === true, 'Return equipment marks allocation Completed');

    const eqCheck2 = await apiCall('GET', `/api/equipment/${newEqId}`);
    assert(eqCheck2.body.data.status === 'Available', "Returned equipment status dynamically transitions back to 'Available'");

    // 5. Maintenance & Damage Reporting
    console.log('\n5. Testing Damage Reporting & Maintenance Lifecycle:');
    const reportRes = await apiCall('POST', '/api/maintenance/report', {
      equipment_id: newEqId,
      issue_description: 'GPIO Pin Header broken during circuit wiring',
      priority: 'High',
      reported_by: 'NARU JAGADEESH'
    });
    assert(reportRes.status === 201 && reportRes.body.data.status === 'Under Maintenance', 'Report damage creates maintenance ticket');

    const eqCheck3 = await apiCall('GET', `/api/equipment/${newEqId}`);
    assert(eqCheck3.body.data.status === 'Under Maintenance', "Damaged equipment status dynamically transitions to 'Under Maintenance'");

    // Resolve maintenance ticket
    const maintId = reportRes.body.data.maintenance_id;
    const resolveRes = await apiCall('PUT', `/api/maintenance/${maintId}/status`, {
      status: 'Resolved',
      cost: 350.0,
      notes: 'Header pins re-soldered and bench-tested.'
    });
    assert(resolveRes.status === 200 && resolveRes.body.success === true, 'Resolve maintenance ticket successfully');

    const eqCheck4 = await apiCall('GET', `/api/equipment/${newEqId}`);
    assert(eqCheck4.body.data.status === 'Available', "Resolved equipment status automatically transitions back to 'Available'");

    // 6. Reports & Aggregations (JOIN & GROUP BY)
    console.log('\n6. Testing Reports & SQL Aggregations (GROUP BY & COUNT):');
    const labReport = await apiCall('GET', '/api/reports/by-laboratory');
    assert(labReport.status === 200 && Array.isArray(labReport.body.data) && labReport.body.totals !== undefined, 'Laboratory report contains aggregated GROUP BY results and totals row');

    const catReport = await apiCall('GET', '/api/reports/by-category');
    assert(catReport.status === 200 && Array.isArray(catReport.body.data) && catReport.body.data.length > 0, 'Category report aggregates equipment counts by category correctly');

    // Clean up created test equipment
    await apiCall('DELETE', `/api/equipment/${newEqId}`);

    console.log('\n====================================================');
    console.log(`📊 Test Summary: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test execution error:', err.message);
  }
}

// Check if server is running before executing tests
http.get(`${BASE_URL}/api/health`, () => {
  runTests();
}).on('error', () => {
  console.error(`❌ Could not connect to Lab EMS backend at ${BASE_URL}.`);
  console.log('Please make sure the backend server is running via `node backend/server.js` or `npm run dev` before running tests.');
});
