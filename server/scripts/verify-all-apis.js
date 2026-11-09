import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import MyJourney from '../src/models/MyJourney.js';
import Trip from '../src/models/Trip.js';
import Stop from '../src/models/Stop.js';
import Bus from '../src/models/Bus.js';
import Route from '../src/models/Route.js';
import Operator from '../src/models/Operator.js';
import SeatInventory from '../src/models/SeatInventory.js';

const results = [];

function recordResult(name, method, url, status, expectedStatus, passed, details = '') {
  results.push({
    name,
    method,
    url,
    status,
    expectedStatus,
    passed,
    details
  });
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} [${method}] ${url} -> ${status} (expected ${expectedStatus}) - ${name} ${details ? '(' + details + ')' : ''}`);
}

async function verifyAllAPIs() {
  console.log('========================================================================');
  console.log('   STARTING COMPREHENSIVE END-TO-END VERIFICATION OF ALL APIS');
  console.log('   Target Database: myjourney | Collection: myjourneycollection');
  console.log('========================================================================\n');

  try {
    await connectDB(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB Atlas: ${mongoose.connection.host}, DB: ${mongoose.connection.name}\n`);

    // Verify target collection existence/access
    const dbCollections = await mongoose.connection.db.listCollections().toArray();
    console.log('Active collections in DB:', dbCollections.map(c => c.name).join(', '));
    const targetColl = dbCollections.find(c => c.name === 'myjourneycollection');
    console.log(`Target collection 'myjourneycollection' present: ${Boolean(targetColl)}\n`);

    // Variables for tokens and dynamic IDs
    let customerToken = '';
    let operatorToken = '';
    let adminToken = '';
    let operatorId = '';
    let testTripId = '';
    let testBoardingStopId = '';
    let testDroppingStopId = '';
    let availableSeatNumber = '';
    let bookedPNR = '';
    let createdOperatorId = '';
    let createdBusId = '';
    let createdStopId = '';
    let createdRouteId = '';
    let createdTripId = '';

    // ==========================================
    // 1. HEALTH & SYSTEM ENDPOINTS
    // ==========================================
    console.log('--- 1. HEALTH & SYSTEM APIS ---');
    {
      const res = await request(app).get('/api/health');
      recordResult('System Health Check', 'GET', '/api/health', res.status, 200, res.status === 200 && res.body.status === 'UP');
    }
    {
      const res = await request(app).get('/api/docs.json');
      recordResult('OpenAPI Specification', 'GET', '/api/docs.json', res.status, 200, res.status === 200 && res.body.openapi === '3.0.0');
    }

    // ==========================================
    // 2. AUTHENTICATION ENDPOINTS
    // ==========================================
    console.log('\n--- 2. AUTHENTICATION APIS ---');
    const testEmail = `verify_user_${Date.now()}@yatrasetu.in`;
    {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Verification Customer',
          email: testEmail,
          password: 'Password@123',
          phone: '+919876543210'
        });
      recordResult('Customer Registration', 'POST', '/api/v1/auth/register', res.status, 201, res.status === 201 && res.body.success === true);
    }
    {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'Password@123'
        });
      customerToken = res.body.data?.token || '';
      recordResult('Customer Login', 'POST', '/api/v1/auth/login', res.status, 200, res.status === 200 && !!customerToken);
    }
    {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);
      recordResult('Get Current User (Me)', 'GET', '/api/v1/auth/me', res.status, 200, res.status === 200 && res.body.data?.user?.email === testEmail);
    }
    {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'operator1@yatrasetu.in',
          password: 'Password@123'
        });
      operatorToken = res.body.data?.token || '';
      operatorId = res.body.data?.user?.operatorId || '';
      recordResult('Operator Login', 'POST', '/api/v1/auth/login', res.status, 200, res.status === 200 && !!operatorToken);
    }
    {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@yatrasetu.in',
          password: 'Password@123'
        });
      adminToken = res.body.data?.token || '';
      recordResult('Admin Login', 'POST', '/api/v1/auth/login', res.status, 200, res.status === 200 && !!adminToken);
    }
    {
      const res = await request(app).post('/api/v1/auth/logout');
      recordResult('User Logout', 'POST', '/api/v1/auth/logout', res.status, 200, res.status === 200);
    }

    // ==========================================
    // 3. PUBLIC SEARCH & TRIP DETAILS
    // ==========================================
    console.log('\n--- 3. PUBLIC DISCOVERY & SEARCH APIS ---');
    {
      const res = await request(app).get('/api/v1/stops');
      const stops = res.body.data?.stops || [];
      if (stops.length >= 2) {
        testBoardingStopId = stops[0]._id;
        testDroppingStopId = stops[1]._id;
      }
      recordResult('List Public Stops', 'GET', '/api/v1/stops', res.status, 200, res.status === 200 && stops.length > 0, `found ${stops.length} stops`);
    }
    {
      const res = await request(app)
        .get(`/api/v1/trips?sourceStopId=${testBoardingStopId}&destinationStopId=${testDroppingStopId}`);
      recordResult('Search Public Trips', 'GET', '/api/v1/trips', res.status, 200, res.status === 200);
    }

    // Find any scheduled trip for testing
    const sampleTrip = await Trip.findOne({ status: 'SCHEDULED', departureAt: { $gte: new Date() } })
      .populate('routeId')
      .populate('busId');
    if (sampleTrip) {
      testTripId = sampleTrip._id.toString();
      if (sampleTrip.routeId?.stops?.length >= 2) {
        testBoardingStopId = sampleTrip.routeId.stops[0].stopId.toString();
        testDroppingStopId = sampleTrip.routeId.stops[sampleTrip.routeId.stops.length - 1].stopId.toString();
      }
    } else {
      const anyTrip = await Trip.findOne().populate('routeId');
      if (anyTrip) {
        testTripId = anyTrip._id.toString();
        testBoardingStopId = anyTrip.routeId.stops[0].stopId.toString();
        testDroppingStopId = anyTrip.routeId.stops[1].stopId.toString();
      }
    }

    {
      const res = await request(app).get(`/api/v1/trips/${testTripId}`);
      recordResult('Get Trip Details', 'GET', `/api/v1/trips/:tripId`, res.status, 200, res.status === 200 && res.body.data?.trip?._id === testTripId);
    }
    {
      const res = await request(app).get(`/api/v1/trips/${testTripId}/seats`);
      const seatInventory = res.body.data?.seats || [];
      const avail = seatInventory.find(s => s.status === 'AVAILABLE');
      if (avail) {
        availableSeatNumber = avail.seatNumber;
      } else if (seatInventory.length > 0) {
        // Free up one seat for test booking
        await SeatInventory.updateOne({ _id: seatInventory[0]._id }, { status: 'AVAILABLE', bookingId: null });
        availableSeatNumber = seatInventory[0].seatNumber;
      }
      recordResult('Get Trip Seat Layout', 'GET', `/api/v1/trips/:tripId/seats`, res.status, 200, res.status === 200 && seatInventory.length > 0, `seat: ${availableSeatNumber}`);
    }

    // ==========================================
    // 4. BOOKING & TRANSACTIONAL WORKFLOW
    // ==========================================
    console.log('\n--- 4. BOOKINGS & DATA PERSISTENCE APIS ---');
    {
      const bookingPayload = {
        tripId: testTripId,
        boardingStopId: testBoardingStopId,
        droppingStopId: testDroppingStopId,
        passengers: [
          {
            name: 'Pramod Kumar',
            age: 29,
            gender: 'MALE',
            seatNumber: availableSeatNumber,
            phone: '+919876543210',
            email: testEmail
          }
        ],
        seatNumbers: [availableSeatNumber]
      };

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingPayload);

      bookedPNR = res.body.data?.booking?.pnr || '';
      recordResult('Create Transactional Booking', 'POST', '/api/v1/bookings', res.status, 201, res.status === 201 && !!bookedPNR, `PNR: ${bookedPNR}`);
    }

    // Verify directly in MongoDB database 'myjourney' and collection 'myjourneycollection'
    {
      const doc = await mongoose.connection.db.collection('myjourneycollection').findOne({ pnr: bookedPNR });
      const pass = Boolean(doc && doc.pnr === bookedPNR);
      recordResult('Verify Direct Persistence in myjourneycollection', 'DB_QUERY', 'myjourney.myjourneycollection', 200, 200, pass, `Stored in myjourneycollection: ${doc ? doc.pnr : 'NOT FOUND'}`);
    }

    {
      const res = await request(app)
        .get('/api/v1/bookings/my')
        .set('Authorization', `Bearer ${customerToken}`);
      const bookings = res.body.data?.bookings || [];
      const found = bookings.some(b => b.pnr === bookedPNR);
      recordResult('Get Customer My Bookings', 'GET', '/api/v1/bookings/my', res.status, 200, res.status === 200 && found);
    }
    {
      const res = await request(app)
        .get(`/api/v1/bookings/${bookedPNR}`)
        .set('Authorization', `Bearer ${customerToken}`);
      recordResult('Get Booking by PNR', 'GET', `/api/v1/bookings/:pnr`, res.status, 200, res.status === 200 && res.body.data?.booking?.pnr === bookedPNR);
    }
    {
      const res = await request(app)
        .post(`/api/v1/bookings/${bookedPNR}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ cancellationReason: 'Test cancellation flow' });
      recordResult('Cancel Booking & Release Seat', 'POST', `/api/v1/bookings/:pnr/cancel`, res.status, 200, res.status === 200 && res.body.data?.booking?.status === 'CANCELLED');
    }

    // Verify cancellation updated in myjourneycollection
    {
      const doc = await mongoose.connection.db.collection('myjourneycollection').findOne({ pnr: bookedPNR });
      const pass = Boolean(doc && doc.status === 'CANCELLED');
      recordResult('Verify Cancellation Sync in myjourneycollection', 'DB_QUERY', 'myjourney.myjourneycollection', 200, 200, pass, `Status: ${doc?.status}, Refund: ₹${doc?.refundAmount}`);
    }

    // ==========================================
    // 5. OPERATOR APIS
    // ==========================================
    console.log('\n--- 5. OPERATOR PORTAL APIS ---');
    {
      const res = await request(app)
        .get('/api/v1/operator/dashboard')
        .set('Authorization', `Bearer ${operatorToken}`);
      recordResult('Operator Dashboard Stats', 'GET', '/api/v1/operator/dashboard', res.status, 200, res.status === 200 && !!res.body.data?.summary);
    }
    {
      const res = await request(app)
        .get('/api/v1/operator/trips')
        .set('Authorization', `Bearer ${operatorToken}`);
      recordResult('Operator Assigned Trips', 'GET', '/api/v1/operator/trips', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.trips));
    }

    // Find an operator-assigned trip for manifest test
    const opTrip = await Trip.findOne({ operatorId });
    const opTripId = opTrip ? opTrip._id.toString() : testTripId;

    {
      const res = await request(app)
        .get(`/api/v1/operator/trips/${opTripId}/manifest`)
        .set('Authorization', `Bearer ${operatorToken}`);
      recordResult('Operator Passenger Manifest', 'GET', `/api/v1/operator/trips/:tripId/manifest`, res.status, 200, res.status === 200 && Array.isArray(res.body.data?.manifest));
    }
    {
      const res = await request(app)
        .get('/api/v1/operator/bookings')
        .set('Authorization', `Bearer ${operatorToken}`);
      recordResult('Operator Bookings List', 'GET', '/api/v1/operator/bookings', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.bookings));
    }
    {
      const res = await request(app)
        .get('/api/v1/operator/reports/occupancy')
        .set('Authorization', `Bearer ${operatorToken}`);
      recordResult('Operator Occupancy Reports', 'GET', '/api/v1/operator/reports/occupancy', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.reports));
    }

    // ==========================================
    // 6. ADMIN APIS
    // ==========================================
    console.log('\n--- 6. ADMIN PORTAL APIS ---');
    {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin Dashboard Analytics', 'GET', '/api/v1/admin/dashboard', res.status, 200, res.status === 200 && !!res.body.data?.overview);
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/operators')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin List Operators', 'GET', '/api/v1/admin/operators', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.operators));
    }
    {
      const res = await request(app)
        .post('/api/v1/admin/operators')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Test Airways & Bus ${Date.now()}`,
          operatorCode: `TB${Math.floor(100 + Math.random() * 900)}`,
          contactEmail: `ops_${Date.now()}@yatrasetu.in`,
          phone: '+919999888877',
          status: 'ACTIVE'
        });
      createdOperatorId = res.body.data?.operator?._id || '';
      recordResult('Admin Create Operator', 'POST', '/api/v1/admin/operators', res.status, 201, res.status === 201 && !!createdOperatorId);
    }
    if (createdOperatorId) {
      const res = await request(app)
        .put(`/api/v1/admin/operators/${createdOperatorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ address: 'Updated Test Address HQ, Ground Floor' });
      recordResult('Admin Update Operator', 'PUT', `/api/v1/admin/operators/:id`, res.status, 200, res.status === 200 && res.body.data?.operator?.address?.includes('Updated'));
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/buses')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin List Buses', 'GET', '/api/v1/admin/buses', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.buses));
    }
    {
      const anyOp = await Operator.findOne();
      const res = await request(app)
        .post('/api/v1/admin/buses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          operatorId: anyOp._id.toString(),
          registrationNumber: `DL${Math.floor(10 + Math.random() * 89)}AB${Math.floor(1000 + Math.random() * 8999)}`,
          busType: 'AC Sleeper 2+1',
          totalSeats: 30,
          seatLayoutType: '2+1',
          amenities: ['WiFi', 'Charging Point', 'Blanket']
        });
      createdBusId = res.body.data?.bus?._id || '';
      recordResult('Admin Create Bus', 'POST', '/api/v1/admin/buses', res.status, 201, res.status === 201 && !!createdBusId);
    }
    if (createdBusId) {
      const res = await request(app)
        .put(`/api/v1/admin/buses/${createdBusId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACTIVE' });
      recordResult('Admin Update Bus', 'PUT', `/api/v1/admin/buses/:id`, res.status, 200, res.status === 200);
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/stops')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin List Stops', 'GET', '/api/v1/admin/stops', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.stops));
    }
    {
      const res = await request(app)
        .post('/api/v1/admin/stops')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Test Terminus ${Date.now()}`,
          city: 'Noida',
          state: 'Uttar Pradesh',
          stopCode: `ND${Math.floor(100 + Math.random() * 899)}`,
          status: 'ACTIVE'
        });
      createdStopId = res.body.data?.stop?._id || '';
      recordResult('Admin Create Stop', 'POST', '/api/v1/admin/stops', res.status, 201, res.status === 201 && !!createdStopId);
    }
    if (createdStopId) {
      const res = await request(app)
        .put(`/api/v1/admin/stops/${createdStopId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ state: 'Uttar Pradesh (West)' });
      recordResult('Admin Update Stop', 'PUT', `/api/v1/admin/stops/:id`, res.status, 200, res.status === 200);
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/routes')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin List Routes', 'GET', '/api/v1/admin/routes', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.routes));
    }
    {
      const stops = await Stop.find().limit(2);
      const res = await request(app)
        .post('/api/v1/admin/routes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          routeName: `Test Express Way ${Date.now()}`,
          routeCode: `RT${Math.floor(1000 + Math.random() * 8999)}`,
          stops: [
            { stopId: stops[0]._id.toString(), stopOrder: 1, distanceKm: 0, timeOffsetMinutes: 0 },
            { stopId: stops[1]._id.toString(), stopOrder: 2, distanceKm: 180, timeOffsetMinutes: 200 }
          ],
          totalDistance: 180,
          estimatedDuration: '3 hrs 20 mins',
          status: 'ACTIVE'
        });
      createdRouteId = res.body.data?.route?._id || '';
      recordResult('Admin Create Route', 'POST', '/api/v1/admin/routes', res.status, 201, res.status === 201 && !!createdRouteId);
    }
    if (createdRouteId) {
      const res = await request(app)
        .put(`/api/v1/admin/routes/${createdRouteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ estimatedDuration: '3 hrs 30 mins' });
      recordResult('Admin Update Route', 'PUT', `/api/v1/admin/routes/:id`, res.status, 200, res.status === 200);
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/trips')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin List Trips', 'GET', '/api/v1/admin/trips', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.trips));
    }
    {
      const route = await Route.findOne();
      const bus = await Bus.findOne();
      const op = await Operator.findOne();
      const departure = new Date(Date.now() + 48 * 3600 * 1000);
      const arrival = new Date(Date.now() + 54 * 3600 * 1000);

      const res = await request(app)
        .post('/api/v1/admin/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          routeId: route._id.toString(),
          busId: bus._id.toString(),
          operatorId: op._id.toString(),
          departureAt: departure.toISOString(),
          arrivalAt: arrival.toISOString(),
          baseFare: 750,
          currency: 'INR',
          status: 'SCHEDULED'
        });
      createdTripId = res.body.data?.trip?._id || '';
      recordResult('Admin Create Trip & Seat Inventory', 'POST', '/api/v1/admin/trips', res.status, 201, res.status === 201 && !!createdTripId);
    }
    if (createdTripId) {
      const res = await request(app)
        .put(`/api/v1/admin/trips/${createdTripId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin Cancel Scheduled Trip', 'PUT', `/api/v1/admin/trips/:id/cancel`, res.status, 200, res.status === 200 && res.body.data?.trip?.status === 'CANCELLED');
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin List All Bookings', 'GET', '/api/v1/admin/bookings', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.bookings));
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/cancellation-policy')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin Get Cancellation Policy', 'GET', '/api/v1/admin/cancellation-policy', res.status, 200, res.status === 200 && !!res.body.data?.policy);
    }
    {
      const res = await request(app)
        .put('/api/v1/admin/cancellation-policy')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          policyName: 'Updated Standard YatraSetu Policy',
          refundTiers: [
            { minHoursBeforeDeparture: 24, refundPercentage: 100 },
            { minHoursBeforeDeparture: 6, refundPercentage: 50 },
            { minHoursBeforeDeparture: 0, refundPercentage: 0 }
          ]
        });
      recordResult('Admin Update Cancellation Policy', 'PUT', '/api/v1/admin/cancellation-policy', res.status, 200, res.status === 200 && res.body.data?.policy?.policyName?.includes('Updated'));
    }
    {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);
      recordResult('Admin Get Audit Logs', 'GET', '/api/v1/admin/audit-logs', res.status, 200, res.status === 200 && Array.isArray(res.body.data?.logs));
    }

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n========================================================================');
    console.log('                      API VERIFICATION SUMMARY');
    console.log('========================================================================');
    const totalTested = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;

    console.log(`Total Endpoints Tested: ${totalTested}`);
    console.log(`Passed:                ${passedTests} ✅`);
    console.log(`Failed:                ${failedTests} ${failedTests === 0 ? '' : '❌'}`);

    if (failedTests > 0) {
      console.log('\nFAILED ENDPOINTS:');
      results.filter(r => !r.passed).forEach(f => {
        console.log(`  - [${f.method}] ${f.url}: Got ${f.status}, expected ${f.expectedStatus} (${f.name})`);
      });
      process.exitCode = 1;
    } else {
      console.log('\n🎉 ALL APIS ARE FULLY OPERATIONAL AND VERIFIED AGAINST MONGODB ATLAS!');
    }

  } catch (err) {
    console.error('Fatal error during API verification:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB connection closed.');
  }
}

verifyAllAPIs();
