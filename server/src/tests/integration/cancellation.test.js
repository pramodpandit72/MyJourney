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
import { SEAT_STATUS, BOOKING_STATUS, REFUND_STATUS } from '../../config/constants.js';

describe('Integration Tests: Cancellation & Seat Release Workflow', () => {
  setupTestDB();

  let user1Token, user2Token;
  let tripDoc, stop1Doc, stop2Doc;
  let confirmedPNR;

  beforeEach(async () => {
    // 1. Policy
    await CancellationPolicy.create({
      policyName: 'Standard Policy',
      refundTiers: [
        { minHoursBeforeDeparture: 24, refundPercentage: 100 },
        { minHoursBeforeDeparture: 6, refundPercentage: 50 },
        { minHoursBeforeDeparture: 0, refundPercentage: 0 }
      ],
      active: true
    });

    // 2. Users
    const u1 = await request(app).post('/api/v1/auth/register').send({
      name: 'User One',
      email: 'user1.cancel@example.com',
      password: 'Password@123'
    });
    user1Token = u1.body.data.token;

    const u2 = await request(app).post('/api/v1/auth/register').send({
      name: 'User Two',
      email: 'user2.cancel@example.com',
      password: 'Password@123'
    });
    user2Token = u2.body.data.token;

    // 3. Infrastructure
    const op = await Operator.create({
      name: 'Rajasthan Royal Trans',
      operatorCode: 'RRT',
      contactEmail: 'rrt@example.com',
      phone: '+91-141-2200001'
    });

    const bus = await Bus.create({
      operatorId: op._id,
      registrationNumber: 'RJ-14-XX-1111',
      busType: 'Deluxe Express (2+2)',
      totalSeats: 40,
      seatLayout: {
        layoutType: '2+2',
        seats: [{ seatNumber: '3A', row: 3, col: 1 }]
      }
    });

    stop1Doc = await Stop.create({ name: 'Stop A', city: 'City A', state: 'State A', stopCode: 'STP-A' });
    stop2Doc = await Stop.create({ name: 'Stop B', city: 'City B', state: 'State B', stopCode: 'STP-B' });

    const route = await Route.create({
      routeName: 'City A to City B',
      routeCode: 'CAB-1',
      totalDistance: 200,
      estimatedDuration: '4h 0m',
      stops: [
        { stopId: stop1Doc._id, stopOrder: 1, distanceKm: 0 },
        { stopId: stop2Doc._id, stopOrder: 2, distanceKm: 200 }
      ]
    });

    // Departure in 36 hours (eligible for 100% refund)
    const departureAt = new Date(Date.now() + 36 * 60 * 60 * 1000);
    const arrivalAt = new Date(departureAt.getTime() + 4 * 60 * 60 * 1000);

    tripDoc = await Trip.create({
      routeId: route._id,
      busId: bus._id,
      operatorId: op._id,
      departureAt,
      arrivalAt,
      baseFare: 500,
      status: 'SCHEDULED'
    });

    await SeatInventory.create({
      tripId: tripDoc._id,
      seatNumber: '3A',
      status: SEAT_STATUS.AVAILABLE
    });

    // User 1 books Seat 3A
    const bookRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        tripId: tripDoc._id.toString(),
        boardingStopId: stop1Doc._id.toString(),
        droppingStopId: stop2Doc._id.toString(),
        passengers: [{ name: 'Pax 3A', age: 30, gender: 'MALE', seatNumber: '3A' }],
        seatNumbers: ['3A']
      });

    confirmedPNR = bookRes.body.data.booking.pnr;
  });

  it('POST /api/v1/bookings/:pnr/cancel should cancel booking, compute simulated refund, and release seat to AVAILABLE', async () => {
    // 1. Cancel the booking
    const cancelRes = await request(app)
      .post(`/api/v1/bookings/${confirmedPNR}/cancel`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ cancellationReason: 'Change of schedule' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.booking.status).toBe(BOOKING_STATUS.CANCELLED);
    expect(cancelRes.body.data.refundInfo.refundPercentage).toBe(100);
    expect(cancelRes.body.data.refundInfo.refundStatus).toBe(REFUND_STATUS.SIMULATED_PROCESSED);

    // 2. Verify seat in DB is now AVAILABLE
    const seat = await SeatInventory.findOne({ tripId: tripDoc._id, seatNumber: '3A' });
    expect(seat.status).toBe(SEAT_STATUS.AVAILABLE);
    expect(seat.bookingId).toBeNull();

    // 3. Verify another user can now book the released seat 3A
    const rebookRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        tripId: tripDoc._id.toString(),
        boardingStopId: stop1Doc._id.toString(),
        droppingStopId: stop2Doc._id.toString(),
        passengers: [{ name: 'New Passenger', age: 24, gender: 'FEMALE', seatNumber: '3A' }],
        seatNumbers: ['3A']
      });

    expect(rebookRes.status).toBe(201);
    expect(rebookRes.body.data.booking.pnr).toBeDefined();
  });

  it('POST /api/v1/bookings/:pnr/cancel should reject cancellation attempts by another customer', async () => {
    const unauthorizedCancel = await request(app)
      .post(`/api/v1/bookings/${confirmedPNR}/cancel`)
      .set('Authorization', `Bearer ${user2Token}`) // User 2 trying to cancel User 1's booking
      .send({ cancellationReason: 'Malicious cancel' });

    expect(unauthorizedCancel.status).toBe(403);
    expect(unauthorizedCancel.body.success).toBe(false);

    // Booking remains CONFIRMED
    const booking = await Booking.findOne({ pnr: confirmedPNR });
    expect(booking.status).toBe(BOOKING_STATUS.CONFIRMED);
  });
});

