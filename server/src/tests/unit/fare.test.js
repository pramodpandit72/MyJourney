import { describe, it, expect } from 'vitest';
import { validateRouteStops, calculateBookingFare } from '../../services/fareService.js';

describe('Unit Tests: Route Stops & Fare Calculation', () => {
  const dummyStops = [
    { stopId: 'stop1', stopOrder: 1, distanceKm: 0 },
    { stopId: 'stop2', stopOrder: 2, distanceKm: 80 },
    { stopId: 'stop3', stopOrder: 3, distanceKm: 180 },
    { stopId: 'stop4', stopOrder: 4, distanceKm: 280 }
  ];

  it('should validate valid stop sequence where boarding occurs before dropping', () => {
    const result = validateRouteStops(dummyStops, 'stop1', 'stop4');
    expect(result.isValid).toBe(true);
    expect(result.boardingIndex).toBe(0);
    expect(result.droppingIndex).toBe(3);
    expect(result.segmentDistanceKm).toBe(280);
  });

  it('should validate intermediate stop segment distance correctly', () => {
    const result = validateRouteStops(dummyStops, 'stop2', 'stop3');
    expect(result.isValid).toBe(true);
    expect(result.segmentDistanceKm).toBe(100); // 180 - 80
  });

  it('should reject when boarding stop occurs after dropping stop in sequence', () => {
    const result = validateRouteStops(dummyStops, 'stop3', 'stop1');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Boarding stop must occur before');
  });

  it('should reject when stops do not belong to the route', () => {
    const result = validateRouteStops(dummyStops, 'stop1', 'unrelatedStop');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('does not belong to this route');
  });

  it('should calculate proportional segment fare with GST and service fee', () => {
    const fare = calculateBookingFare({
      baseFare: 1000,
      totalRouteDistance: 280,
      segmentDistanceKm: 140, // 50% distance
      passengerCount: 2
    });

    expect(fare.perPassengerFare).toBe(500); // 1000 * 0.5
    expect(fare.baseFareTotal).toBe(1000);   // 500 * 2
    expect(fare.gstAmount).toBe(50);         // 5% of 1000
    expect(fare.serviceFee).toBe(20);
    expect(fare.totalAmount).toBe(1070);     // 1000 + 50 + 20
  });

  it('should enforce minimum segment ratio of 0.40 for operational viability', () => {
    const fare = calculateBookingFare({
      baseFare: 1000,
      totalRouteDistance: 280,
      segmentDistanceKm: 28, // 10% distance -> clamped to 40%
      passengerCount: 1
    });

    expect(fare.perPassengerFare).toBe(400); // 1000 * 0.4
  });
});

