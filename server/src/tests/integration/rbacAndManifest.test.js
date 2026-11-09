import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { setupTestDB } from '../setup.js';
import Operator from '../../models/Operator.js';
import Bus from '../../models/Bus.js';
import Stop from '../../models/Stop.js';
import Route from '../../models/Route.js';
import Trip from '../../models/Trip.js';
import SeatInventory from '../../models/SeatInventory.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { USER_ROLES, SEAT_STATUS, BOOKING_STATUS } from '../../config/constants.js';

describe('Integration Tests: Role-Based Authorization & Operator Manifests', () => {
  setupTestDB();

  let adminToken, operator1Token, operator2Token, customerToken;
  let op1Doc, op2Doc;
  let trip1Doc, trip2Doc;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);

    // 1. Create Operators
    op1Doc = await Operator.create({
      name: 'Delhi Operator Corp',
      operatorCode: 'DOC',
      contactEmail: 'doc@example.com',
      phone: '+91-11-23860001'
    });

    op2Doc = await Operator.create({
      name: 'Jaipur Operator Corp',
      operatorCode: 'JOC',
      contactEmail: 'joc@example.com',
      phone: '+91-141-2200001'
    });

    // 2. Create Users with specific roles
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin.test@example.com',
      passwordHash,
      role: USER_ROLES.ADMIN
    });

    const op1User = await User.create({
      name: 'Delhi Staff',
      email: 'op1.test@example.com',
      passwordHash,
      role: USER_ROLES.OPERATOR,
      operatorId: op1Doc._id
    });

    const op2User = await User.create({
      name: 'Jaipur Staff',
      email: 'op2.test@example.com',
      passwordHash,
      role: USER_ROLES.OPERATOR,
      operatorId: op2Doc._id
    });

    const custUser = await User.create({
      name: 'Customer User',
      email: 'cust.test@example.com',
      passwordHash,
      role: USER_ROLES.CUSTOMER
    });

    // Login each to obtain tokens
    const [aRes, o1Res, o2Res, cRes] = await Promise.all([
      request(app).post('/api/v1/auth/login').send({ email: 'admin.test@example.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'op1.test@example.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'op2.test@example.com', password: 'Password@123' }),
      request(app).post('/api/v1/auth/login').send({ email: 'cust.test@example.com', password: 'Password@123' })
    ]);

    adminToken = aRes.body.data.token;
    operator1Token = o1Res.body.data.token;
    operator2Token = o2Res.body.data.token;
    customerToken = cRes.body.data.token;

    // 3. Infrastructure for trips
    const bus1 = await Bus.create({
      operatorId: op1Doc._id,
      registrationNumber: 'DL-01-AA-1111',
      busType: 'Volvo AC (2+2)',
      totalSeats: 40,
      seatLayout: { layoutType: '2+2', seats: [{ seatNumber: '1A', row: 1, col: 1 }] }
    });

    const bus2 = await Bus.create({
      operatorId: op2Doc._id,
      registrationNumber: 'RJ-14-BB-2222',
      busType: 'Volvo AC (2+2)',
      totalSeats: 40,
      seatLayout: { layoutType: '2+2', seats: [{ seatNumber: '1A', row: 1, col: 1 }] }
    });

    const s1 = await Stop.create({ name: 'Stop 1', city: 'City 1', state: 'State 1', stopCode: 'STP-1' });
    const s2 = await Stop.create({ name: 'Stop 2', city: 'City 2', state: 'State 2', stopCode: 'STP-2' });

    const route = await Route.create({
      routeName: 'City 1 to City 2',
      routeCode: 'C1-C2',
      totalDistance: 150,
      estimatedDuration: '3h',
      stops: [
        { stopId: s1._id, stopOrder: 1, distanceKm: 0 },
        { stopId: s2._id, stopOrder: 2, distanceKm: 150 }
      ]
    });

    trip1Doc = await Trip.create({
      routeId: route._id,
      busId: bus1._id,
      operatorId: op1Doc._id,
      departureAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
      arrivalAt: new Date(Date.now() + 13 * 60 * 60 * 1000),
      baseFare: 400
    });

    trip2Doc = await Trip.create({
      routeId: route._id,
      busId: bus2._id,
      operatorId: op2Doc._id,
      departureAt: new Date(Date.now() + 10 * 60 * 60 * 1000),
      arrivalAt: new Date(Date.now() + 13 * 60 * 60 * 1000),
      baseFare: 400
    });

    // Seed seat inventory and 1 confirmed booking on Trip 1
    const booking = await Booking.create({
      pnr: 'YS99TEST1',
      userId: custUser._id,
      tripId: trip1Doc._id,
      boardingStopId: s1._id,
      droppingStopId: s2._id,
      passengers: [{ name: 'Test Passenger', age: 29, gender: 'MALE', seatNumber: '1A' }],
      seatNumbers: ['1A'],
      totalAmount: 440,
      status: BOOKING_STATUS.CONFIRMED
    });

    await SeatInventory.create({
      tripId: trip1Doc._id,
      seatNumber: '1A',
      status: SEAT_STATUS.BOOKED,
      bookingId: booking._id
    });
  });

  it('RBAC: Customers must be forbidden (403) from accessing admin routes', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('RBAC: Administrators can successfully access admin dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary).toBeDefined();
  });

  it('OPERATOR BOUNDARY: Operator 1 can view manifest for assigned trip 1', async () => {
    const res = await request(app)
      .get(`/api/v1/operator/trips/${trip1Doc._id}/manifest`)
      .set('Authorization', `Bearer ${operator1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.manifest.length).toBe(1);
    expect(res.body.data.manifest[0].passengerName).toBe('Test Passenger');
    expect(res.body.data.manifest[0].seatNumber).toBe('1A');
  });

  it('OPERATOR BOUNDARY: Operator 2 must be forbidden (403) from viewing manifest of Operator 1’s trip', async () => {
    const res = await request(app)
      .get(`/api/v1/operator/trips/${trip1Doc._id}/manifest`)
      .set('Authorization', `Bearer ${operator2Token}`); // Operator 2 attempting to view Operator 1 trip

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('You cannot view manifests for other operators');
  });
});

