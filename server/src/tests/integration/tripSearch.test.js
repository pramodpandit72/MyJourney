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
import { SEAT_STATUS } from '../../config/constants.js';

describe('Integration Tests: Public Stops & Search Trips API', () => {
  setupTestDB();

  let s1, s2, s3, trip;

  beforeEach(async () => {
    const op = await Operator.create({
      name: 'Delhi Transport Corp',
      operatorCode: 'DTC',
      contactEmail: 'dtc@example.com',
      phone: '+91-11-23860001'
    });

    const bus = await Bus.create({
      operatorId: op._id,
      registrationNumber: 'DL-01-SEARCH',
      busType: 'Volvo Multi-Axle AC (2+2)',
      totalSeats: 40,
      amenities: ['WiFi', 'AC'],
      seatLayout: { layoutType: '2+2', seats: [{ seatNumber: '1A', row: 1, col: 1 }] }
    });

    s1 = await Stop.create({ name: 'Stop Alpha', city: 'Delhi', state: 'Delhi', stopCode: 'STP-ALP' });
    s2 = await Stop.create({ name: 'Stop Beta', city: 'Gurgaon', state: 'Haryana', stopCode: 'STP-BET' });
    s3 = await Stop.create({ name: 'Stop Gamma', city: 'Jaipur', state: 'Rajasthan', stopCode: 'STP-GAM' });

    const route = await Route.create({
      routeName: 'Delhi to Jaipur via Gurgaon',
      routeCode: 'DEL-GUR-JAI',
      totalDistance: 270,
      estimatedDuration: '5h 0m',
      stops: [
        { stopId: s1._id, stopOrder: 1, distanceKm: 0 },
        { stopId: s2._id, stopOrder: 2, distanceKm: 40 },
        { stopId: s3._id, stopOrder: 3, distanceKm: 270 }
      ]
    });

    // Schedule trip tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const arrival = new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000);

    trip = await Trip.create({
      routeId: route._id,
      busId: bus._id,
      operatorId: op._id,
      departureAt: tomorrow,
      arrivalAt: arrival,
      baseFare: 800,
      status: 'SCHEDULED'
    });

    await SeatInventory.create({
      tripId: trip._id,
      seatNumber: '1A',
      status: SEAT_STATUS.AVAILABLE
    });
  });

  it('GET /api/v1/stops should return all active stops', async () => {
    const res = await request(app).get('/api/v1/stops');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stops.length).toBe(3);
  });

  it('GET /api/v1/trips should find matching trips by date and route stops', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const res = await request(app).get(
      `/api/v1/trips?originStopId=${s1._id}&destinationStopId=${s3._id}&travelDate=${dateStr}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.trips.length).toBe(1);
    expect(res.body.data.trips[0].bus.registrationNumber).toBe('DL-01-SEARCH');
    expect(res.body.data.trips[0].availableSeatsCount).toBe(40);
  });

  it('GET /api/v1/trips/:tripId/seats should return layout and seat status', async () => {
    const res = await request(app).get(`/api/v1/trips/${trip._id}/seats`);
    expect(res.status).toBe(200);
    expect(res.body.data.seats.length).toBe(1);
    expect(res.body.data.seats[0].seatNumber).toBe('1A');
    expect(res.body.data.seats[0].status).toBe(SEAT_STATUS.AVAILABLE);
  });
});

