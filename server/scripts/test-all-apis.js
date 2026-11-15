// Comprehensive End-to-End API Audit Script for MyJourney
const BASE_URL = 'http://localhost:5000/api/v1';
const ROOT_URL = 'http://localhost:5000/api';

const results = [];

function record(name, status, details = '') {
  results.push({ name, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'SKIP' ? '⚠️' : '❌';
  console.log(`${icon} [${status}] ${name}${details ? ` -> ${details}` : ''}`);
}

async function runAudit() {
  console.log('================================================================');
  console.log('🚀 MYJOURNEY FULL COMPREHENSIVE API & FEATURE AUDIT');
  console.log('================================================================\n');

  let adminToken = '';
  let operatorToken = '';
  let customerToken = '';
  let customerUser = null;
  let testTripId = '';
  let createdBookingPNR = '';

  // 0. HEALTH & DOCS
  console.log('--- 0. System Health & API Documentation ---');
  try {
    const res = await fetch(`${ROOT_URL}/health`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'UP') {
      record('GET /api/health', 'PASS', `Service: ${data.service}`);
    } else {
      record('GET /api/health', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /api/health', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${ROOT_URL}/docs.json`);
    const data = await res.json();
    if (res.status === 200 && data.openapi) {
      record('GET /api/docs.json', 'PASS', `OpenAPI Version: ${data.openapi}, Title: ${data.info?.title}`);
    } else {
      record('GET /api/docs.json', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /api/docs.json', 'FAIL', err.message);
  }

  // 1. PUBLIC APIS
  console.log('\n--- 1. Public Search & Corridor Discovery APIs ---');
  try {
    const res = await fetch(`${BASE_URL}/stops`);
    const data = await res.json();
    if (res.status === 200 && data.success && data.data?.stops?.length > 0) {
      record('GET /stops', 'PASS', `Found ${data.data.stops.length} active stops`);
    } else {
      record('GET /stops', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /stops', 'FAIL', err.message);
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`${BASE_URL}/trips?travelDate=${today}`);
    const data = await res.json();
    if (res.status === 200 && data.success) {
      record('GET /trips (date search)', 'PASS', `Found ${data.data.trips?.length || 0} scheduled trips for today`);
      if (data.data.trips?.length > 0) {
        testTripId = data.data.trips[0]._id;
      }
    } else {
      record('GET /trips (date search)', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /trips (date search)', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/trips?originQuery=delhi&destinationQuery=jaipur`);
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.trips?.length > 0) {
      record('GET /trips (corridor query: Delhi -> Jaipur)', 'PASS', `Found ${data.data.trips.length} active trips`);
      if (!testTripId) testTripId = data.data.trips[0]._id;
    } else {
      record('GET /trips (corridor query)', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /trips (corridor query)', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/available-states`);
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.states?.length > 0) {
      record('GET /auth/available-states', 'PASS', `Catalogued ${data.data.states.length} Indian States & UTs`);
    } else {
      record('GET /auth/available-states', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /auth/available-states', 'FAIL', err.message);
  }

  if (testTripId) {
    try {
      const res = await fetch(`${BASE_URL}/trips/${testTripId}`);
      const data = await res.json();
      if (res.status === 200 && data.success && data.data.trip) {
        record('GET /trips/:tripId', 'PASS', `Trip: ${data.data.trip.route?.routeName || testTripId}`);
      } else {
        record('GET /trips/:tripId', 'FAIL', `Status ${res.status}`);
      }
    } catch (err) {
      record('GET /trips/:tripId', 'FAIL', err.message);
    }

    try {
      const res = await fetch(`${BASE_URL}/trips/${testTripId}/seats`);
      const data = await res.json();
      if (res.status === 200 && data.success && data.data.seats?.length > 0) {
        record('GET /trips/:tripId/seats', 'PASS', `Loaded layout with ${data.data.seats.length} seats`);
      } else {
        record('GET /trips/:tripId/seats', 'FAIL', `Status ${res.status}`);
      }
    } catch (err) {
      record('GET /trips/:tripId/seats', 'FAIL', err.message);
    }
  }

  // 2. AUTHENTICATION APIS
  console.log('\n--- 2. Authentication & Identity Management ---');
  // Admin Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nwdpramod12305901@gmail.com', password: '@123Prazapati' })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.token) {
      adminToken = data.data.token;
      record('POST /auth/login (National Super Admin)', 'PASS', `Role: ${data.data.user.role}, State: ${data.data.user.assignedState}`);
    } else {
      record('POST /auth/login (National Super Admin)', 'FAIL', `Status ${res.status}: ${data.message || ''}`);
    }
  } catch (err) {
    record('POST /auth/login (National Super Admin)', 'FAIL', err.message);
  }

  // Operator Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'operator.delhi@myjourney.in', password: 'Password@123' })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.token) {
      operatorToken = data.data.token;
      record('POST /auth/login (State Operator)', 'PASS', `Role: ${data.data.user.role}`);
    } else {
      record('POST /auth/login (State Operator)', 'FAIL', `Status ${res.status}: ${data.message || ''}`);
    }
  } catch (err) {
    record('POST /auth/login (State Operator)', 'FAIL', err.message);
  }

  // Customer Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@myjourney.in', password: 'Password@123' })
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.token) {
      customerToken = data.data.token;
      customerUser = data.data.user;
      record('POST /auth/login (Passenger)', 'PASS', `User: ${customerUser.name || customerUser.email}`);
    } else {
      record('POST /auth/login (Passenger)', 'FAIL', `Status ${res.status}: ${data.message || ''}`);
    }
  } catch (err) {
    record('POST /auth/login (Passenger)', 'FAIL', err.message);
  }

  // Customer Profile (GET /auth/me)
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.user?.email === 'customer@myjourney.in') {
      record('GET /auth/me (Authenticated profile)', 'PASS', `Verified email: ${data.data.user.email}`);
    } else {
      record('GET /auth/me', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /auth/me', 'FAIL', err.message);
  }

  // Registration of New Passenger
  const randomEmail = `audit_user_${Date.now()}@myjourney.in`;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Test Passenger',
        email: randomEmail,
        password: 'Password@123',
        phone: '9876500000'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success && data.data.token) {
      record('POST /auth/register (Passenger)', 'PASS', `Registered: ${randomEmail}`);
    } else {
      record('POST /auth/register (Passenger)', 'FAIL', `Status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    record('POST /auth/register (Passenger)', 'FAIL', err.message);
  }

  // Logout
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      record('POST /auth/logout', 'PASS', 'Cleared auth cookie');
    } else {
      record('POST /auth/logout', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('POST /auth/logout', 'FAIL', err.message);
  }

  // 3. BOOKINGS WORKFLOW
  console.log('\n--- 3. Customer Booking & Cancellation Workflow ---');
  try {
    const searchRes = await fetch(`${BASE_URL}/trips?originQuery=delhi&destinationQuery=jaipur`);
    const searchData = await searchRes.json();
    const availableTrip = searchData.data?.trips?.find(t => new Date(t.departureAt) > new Date());

    if (availableTrip) {
      const seatsRes = await fetch(`${BASE_URL}/trips/${availableTrip._id}/seats`);
      const seatsData = await seatsRes.json();
      const freeSeat = seatsData.data?.seats?.find(s => s.status === 'AVAILABLE');

      if (freeSeat) {
        const bookingPayload = {
          tripId: availableTrip._id,
          boardingStopId: availableTrip.boardingStop?.stopId?._id || availableTrip.boardingStop?.stopId,
          droppingStopId: availableTrip.droppingStop?.stopId?._id || availableTrip.droppingStop?.stopId,
          seatNumbers: [freeSeat.seatNumber],
          passengers: [
            {
              name: 'Audit Passenger',
              age: 28,
              gender: 'MALE',
              seatNumber: freeSeat.seatNumber,
              phone: '9876543210',
              email: 'audit@myjourney.in'
            }
          ]
        };

        const createRes = await fetch(`${BASE_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customerToken}`
          },
          body: JSON.stringify(bookingPayload)
        });
        const createData = await createRes.json();
        if (createRes.status === 201 && createData.success && createData.data?.booking?.pnr) {
          createdBookingPNR = createData.data.booking.pnr;
          record('POST /bookings (Create Booking)', 'PASS', `Booked seat ${freeSeat.seatNumber}, PNR: ${createdBookingPNR}`);
        } else {
          record('POST /bookings (Create Booking)', 'FAIL', `Status ${createRes.status}: ${createData.message || JSON.stringify(createData)}`);
        }
      } else {
        record('POST /bookings', 'SKIP', 'No available seat found on trip');
      }
    } else {
      record('POST /bookings', 'SKIP', 'No upcoming trip found for Delhi-Jaipur');
    }
  } catch (err) {
    record('POST /bookings', 'FAIL', err.message);
  }

  // GET /bookings/my
  try {
    const res = await fetch(`${BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.bookings)) {
      record('GET /bookings/my', 'PASS', `Retrieved ${data.data.bookings.length} user bookings`);
    } else {
      record('GET /bookings/my', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /bookings/my', 'FAIL', err.message);
  }

  // GET /bookings/:pnr
  const pnrToQuery = createdBookingPNR || 'YS7A9K2M';
  try {
    const res = await fetch(`${BASE_URL}/bookings/${pnrToQuery}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data?.booking) {
      record(`GET /bookings/:pnr (${pnrToQuery})`, 'PASS', `Status: ${data.data.booking.status}, Fare: ₹${data.data.booking.totalAmount}`);
    } else {
      record(`GET /bookings/:pnr (${pnrToQuery})`, 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record(`GET /bookings/:pnr (${pnrToQuery})`, 'FAIL', err.message);
  }

  // POST /bookings/:pnr/cancel
  if (createdBookingPNR) {
    try {
      const res = await fetch(`${BASE_URL}/bookings/${createdBookingPNR}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`
        },
        body: JSON.stringify({ cancellationReason: 'Audit cancellation test' })
      });
      const data = await res.json();
      if (res.status === 200 && data.success && data.data?.booking?.status === 'CANCELLED') {
        record(`POST /bookings/:pnr/cancel (${createdBookingPNR})`, 'PASS', `Cancelled successfully. Refund: ₹${data.data.refundInfo?.refundAmount || 0}`);
      } else {
        record(`POST /bookings/:pnr/cancel (${createdBookingPNR})`, 'FAIL', `Status ${res.status}: ${data.message || ''}`);
      }
    } catch (err) {
      record(`POST /bookings/:pnr/cancel (${createdBookingPNR})`, 'FAIL', err.message);
    }
  }

  // 4. OPERATOR APIS
  console.log('\n--- 4. State Roadways Operator Portal APIs ---');
  try {
    const res = await fetch(`${BASE_URL}/operator/dashboard`, {
      headers: { Authorization: `Bearer ${operatorToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data) {
      record('GET /operator/dashboard', 'PASS', `Operator: ${data.data.operator?.name || 'Verified'}`);
    } else {
      record('GET /operator/dashboard', 'FAIL', `Status ${res.status}: ${data.message || ''}`);
    }
  } catch (err) {
    record('GET /operator/dashboard', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/operator/trips`, {
      headers: { Authorization: `Bearer ${operatorToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.trips)) {
      record('GET /operator/trips', 'PASS', `Retrieved ${data.data.trips.length} assigned operator trips`);
      if (data.data.trips.length > 0) {
        const opTripId = data.data.trips[0]._id;
        const manifestRes = await fetch(`${BASE_URL}/operator/trips/${opTripId}/manifest`, {
          headers: { Authorization: `Bearer ${operatorToken}` }
        });
        const manifestData = await manifestRes.json();
        if (manifestRes.status === 200 && manifestData.success) {
          record('GET /operator/trips/:tripId/manifest', 'PASS', `Manifest passenger count: ${manifestData.data?.passengers?.length ?? 0}`);
        } else {
          record('GET /operator/trips/:tripId/manifest', 'FAIL', `Status ${manifestRes.status}`);
        }
      }
    } else {
      record('GET /operator/trips', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /operator/trips', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/operator/bookings`, {
      headers: { Authorization: `Bearer ${operatorToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      record('GET /operator/bookings', 'PASS', `Operator bookings list retrieved`);
    } else {
      record('GET /operator/bookings', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /operator/bookings', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/operator/reports/occupancy`, {
      headers: { Authorization: `Bearer ${operatorToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      record('GET /operator/reports/occupancy', 'PASS', `Occupancy report generated`);
    } else {
      record('GET /operator/reports/occupancy', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /operator/reports/occupancy', 'FAIL', err.message);
  }

  // 5. ADMIN APIS
  console.log('\n--- 5. Government Administration & Oversight APIs ---');
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data?.summary) {
      record('GET /admin/dashboard', 'PASS', `Total Bookings: ${data.data.summary.totalBookings}, Revenue: ₹${data.data.summary.totalRevenue}`);
    } else {
      record('GET /admin/dashboard', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/dashboard', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/operators`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.operators)) {
      record('GET /admin/operators', 'PASS', `Found ${data.data.operators.length} registered operators`);
    } else {
      record('GET /admin/operators', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/operators', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/buses`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.buses)) {
      record('GET /admin/buses', 'PASS', `Found ${data.data.buses.length} active fleet buses`);
    } else {
      record('GET /admin/buses', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/buses', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/routes`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.routes)) {
      record('GET /admin/routes', 'PASS', `Found ${data.data.routes.length} published routes`);
    } else {
      record('GET /admin/routes', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/routes', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/trips`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.trips)) {
      record('GET /admin/trips', 'PASS', `Found ${data.data.trips.length} managed scheduled trips`);
    } else {
      record('GET /admin/trips', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/trips', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/stops`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.stops)) {
      record('GET /admin/stops', 'PASS', `Found ${data.data.stops.length} terminal stops`);
    } else {
      record('GET /admin/stops', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/stops', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.bookings)) {
      record('GET /admin/bookings', 'PASS', `Found ${data.data.bookings.length} system bookings`);
    } else {
      record('GET /admin/bookings', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/bookings', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/cancellation-policy`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data?.policy) {
      record('GET /admin/cancellation-policy', 'PASS', `Policy: ${data.data.policy.policyName || 'Standard'}`);
    } else {
      record('GET /admin/cancellation-policy', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/cancellation-policy', 'FAIL', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.logs)) {
      record('GET /admin/audit-logs', 'PASS', `Retrieved ${data.data.logs.length} compliance audit events`);
    } else {
      record('GET /admin/audit-logs', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/audit-logs', 'FAIL', err.message);
  }

  // 6. STATE ADMINS GOVERNANCE
  console.log('\n--- 6. State Administrators Governance & Super Admin Controls ---');
  try {
    const res = await fetch(`${BASE_URL}/admin/state-admins`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.data?.admins)) {
      record('GET /admin/state-admins', 'PASS', `Found ${data.data.admins.length} state administrators`);
    } else {
      record('GET /admin/state-admins', 'FAIL', `Status ${res.status}`);
    }
  } catch (err) {
    record('GET /admin/state-admins', 'FAIL', err.message);
  }

  // 7. RBAC SECURITY CHECKS
  console.log('\n--- 7. Security Boundary & Access Control Enforcement (RBAC) ---');
  // Customer blocked from /admin/dashboard -> 403
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    if (res.status === 403) {
      record('RBAC: Customer blocked from /admin/dashboard', 'PASS', 'Correctly returned 403 Forbidden');
    } else {
      record('RBAC: Customer blocked from /admin/dashboard', 'FAIL', `Expected 403, got ${res.status}`);
    }
  } catch (err) {
    record('RBAC Check', 'FAIL', err.message);
  }

  // Customer blocked from /operator/dashboard -> 403
  try {
    const res = await fetch(`${BASE_URL}/operator/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    if (res.status === 403) {
      record('RBAC: Customer blocked from /operator/dashboard', 'PASS', 'Correctly returned 403 Forbidden');
    } else {
      record('RBAC: Customer blocked from /operator/dashboard', 'FAIL', `Expected 403, got ${res.status}`);
    }
  } catch (err) {
    record('RBAC Check', 'FAIL', err.message);
  }

  // Unauthenticated user blocked from /bookings/my -> 401
  try {
    const res = await fetch(`${BASE_URL}/bookings/my`);
    if (res.status === 401) {
      record('RBAC: Anonymous user blocked from /bookings/my', 'PASS', 'Correctly returned 401 Unauthorized');
    } else {
      record('RBAC: Anonymous user blocked from /bookings/my', 'FAIL', `Expected 401, got ${res.status}`);
    }
  } catch (err) {
    record('RBAC Check', 'FAIL', err.message);
  }

  console.log('\n================================================================');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const skipCount = results.filter(r => r.status === 'SKIP').length;
  console.log(`📊 FINAL AUDIT SUMMARY: Total Tests: ${results.length} | Passed: ${passCount} | Failed: ${failCount} | Skipped: ${skipCount}`);
  console.log('================================================================\n');
}

runAudit();
