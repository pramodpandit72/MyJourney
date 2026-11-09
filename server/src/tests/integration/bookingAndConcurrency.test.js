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
import CancellationPolicy from '../../models/CancellationPolicy.js';
import { SEAT_STATUS, BOOKING_STATUS } from '../../config/constants.js';

describe('Integration Tests: ACID Booking & Concurrent Race Conditions', () => {
  setupTestDB();

  let user1Token, user2Token;
  let tripDoc, stop1Doc, stop2Doc;

  beforeEach(async () => {
    // 1. Create Default Cancellation Policy
    await CancellationPolicy.create({
      policyName: 'Standard Policy',
      refundTiers: [
        { minHoursBeforeDeparture: 24, refundPercentage: 100 },
        { minHoursBeforeDeparture: 6, refundPercentage: 50 },
        { minHoursBeforeDeparture: 0, refundPercentage: 0 }
      ],
      active: true
    });

    // 2. Register User 1 & User 2
    const u1Res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'User One', email: 'user1@example.com', password: 'Password@123' });
    user1Token = u1Res.body.data.token;

    const u2Res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'User Two', email: 'user2@example.com', password: 'Password@123' });
    user2Token = u2Res.body.data.token;

    // 3. Create Infrastructure: Operator, Bus, Stops, Route, Trip
    const op = await Operator.create({
      name: 'Delhi State Express',
      operatorCode: 'DSE',
      contactEmail: 'dse@example.com',
      phone: '+91-11-23860001'
    });

    const bus = await Bus.create({
      operatorId: op._id,
      registrationNumber: 'DL-01-XX-9999',
      busType: 'AC Seater (2+2)',
      totalSeats: 40,
      seatLayout: {
        layoutType: '2+2',
        seats: [
          { seatNumber: '1A', row: 1, col: 1 },
          { seatNumber: '1B', row: 1, col: 2 },
          { seatNumber: '2A', row: 2, col: 1 },
          { seatNumber: '2B', row: 2, col: 2 }
        ]
      }
    });

    stop1Doc = await Stop.create({
      name: 'Kashmere Gate ISBT',
      city: 'Delhi',
      state: 'Delhi',
      stopCode: 'DEL-KG'
    });

    stop2Doc = await Stop.create({
      name: 'Sindhi Camp',
      city: 'Jaipur',
      state: 'Rajasthan',
      stopCode: 'JAI-SC'
    });

    const route = await Route.create({
      routeName: 'Delhi to Jaipur',
      routeCode: 'DEL-JAI-1',
      totalDistance: 270,
      estimatedDuration: '5h 0m',
      stops: [
        { stopId: stop1Doc._id, stopOrder: 1, distanceKm: 0 },
        { stopId: stop2Doc._id, stopOrder: 2, distanceKm: 270 }
      ]
    });

    const departureAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h in future
    const arrivalAt = new Date(departureAt.getTime() + 5 * 60 * 60 * 1000);

    tripDoc = await Trip.create({
      routeId: route._id,
      busId: bus._id,
      operatorId: op._id,
      departureAt,
      arrivalAt,
      baseFare: 800,
      status: 'SCHEDULED'
    });

    // Seed seat inventory for seats 1A, 1B, 2A, 2B
    await SeatInventory.insertMany([
      { tripId: tripDoc._id, seatNumber: '1A', status: SEAT_STATUS.AVAILABLE },
      { tripId: tripDoc._id, seatNumber: '1B', status: SEAT_STATUS.AVAILABLE },
      { tripId: tripDoc._id, seatNumber: '2A', status: SEAT_STATUS.AVAILABLE },
      { tripId: tripDoc._id, seatNumber: '2B', status: SEAT_STATUS.AVAILABLE }
    ]);
  });

  it('CRITICAL CONCURRENCY: Simultaneous booking of Seat 1A by 2 different users must succeed for exactly one and return 409 Conflict for the other', async () => {
    const bookingPayload1 = {
      tripId: tripDoc._id.toString(),
      boardingStopId: stop1Doc._id.toString(),
      droppingStopId: stop2Doc._id.toString(),
      passengers: [{ name: 'User 1 Passenger', age: 30, gender: 'MALE', seatNumber: '1A' }],
      seatNumbers: ['1A']
    };

    const bookingPayload2 = {
      tripId: tripDoc._id.toString(),
      boardingStopId: stop1Doc._id.toString(),
      droppingStopId: stop2Doc._id.toString(),
      passengers: [{ name: 'User 2 Passenger', age: 28, gender: 'FEMALE', seatNumber: '1A' }],
      seatNumbers: ['1A']
    };

    // Dispatch concurrently
    const [res1, res2] = await Promise.all([
      request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${user1Token}`).send(bookingPayload1),
      request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${user2Token}`).send(bookingPayload2)
    ]);

    const statuses = [res1.status, res2.status].sort();

    // Exactly one must be 201 Created and the other must be 409 Conflict!
    expect(statuses).toEqual([201, 409]);

    const winnerRes = res1.status === 201 ? res1 : res2;
    const loserRes = res1.status === 409 ? res1 : res2;

    expect(winnerRes.body.success).toBe(true);
    expect(winnerRes.body.data.booking.pnr).toBeDefined();

    expect(loserRes.body.success).toBe(false);
    expect(loserRes.body.error.code).toBe('SEAT_UNAVAILABLE');

    // Database state verification: Exactly ONE booking in DB
    const confirmedBookings = await Booking.find({ tripId: tripDoc._id, status: BOOKING_STATUS.CONFIRMED });
    expect(confirmedBookings.length).toBe(1);

    // Database seat verification: Seat 1A is associated with only one booking
    const seat1A = await SeatInventory.findOne({ tripId: tripDoc._id, seatNumber: '1A' });
    expect(seat1A.status).toBe(SEAT_STATUS.BOOKED);
    expect(seat1A.bookingId.toString()).toBe(confirmedBookings[0]._id.toString());
  });

  it('MULTI-SEAT ATOMICITY: Booking multiple seats where one is already taken must abort transaction completely and leave available seats untouched', async () => {
    // 1. First claim seat 2B
    await SeatInventory.updateOne(
      { tripId: tripDoc._id, seatNumber: '2B' },
      { $set: { status: SEAT_STATUS.BOOKED } }
    );

    // 2. User attempts to book seats ['2A', '2B']
    const payload = {
      tripId: tripDoc._id.toString(),
      boardingStopId: stop1Doc._id.toString(),
      droppingStopId: stop2Doc._id.toString(),
      passengers: [
        { name: 'Pax 1', age: 25, gender: 'MALE', seatNumber: '2A' },
        { name: 'Pax 2', age: 26, gender: 'FEMALE', seatNumber: '2B' }
      ],
      seatNumbers: ['2A', '2B']
    };

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${user1Token}`)
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SEAT_UNAVAILABLE');

    // Verification: Seat 2A must remain AVAILABLE because transaction rolled back!
    const seat2A = await SeatInventory.findOne({ tripId: tripDoc._id, seatNumber: '2A' });
    expect(seat2A.status).toBe(SEAT_STATUS.AVAILABLE);
    expect(seat2A.bookingId).toBeNull();
  });
});

