import { describe, it, expect } from 'vitest';
import { createBookingSchema } from '../../validators/bookingValidator.js';

describe('Unit Tests: Passenger & Seat Booking Validation Schema', () => {
  it('should pass with valid matching passenger and seat count', async () => {
    const validData = {
      tripId: '507f1f77bcf86cd799439011',
      boardingStopId: '507f1f77bcf86cd799439012',
      droppingStopId: '507f1f77bcf86cd799439013',
      passengers: [
        { name: 'Ramesh Kumar', age: 34, gender: 'MALE', seatNumber: '1A' },
        { name: 'Sunita Kumar', age: 31, gender: 'FEMALE', seatNumber: '1B' }
      ],
      seatNumbers: ['1A', '1B']
    };

    const parsed = await createBookingSchema.parseAsync(validData);
    expect(parsed).toBeDefined();
    expect(parsed.passengers.length).toBe(2);
  });

  it('should reject when passenger count does not match seat count', async () => {
    const invalidData = {
      tripId: '507f1f77bcf86cd799439011',
      boardingStopId: '507f1f77bcf86cd799439012',
      droppingStopId: '507f1f77bcf86cd799439013',
      passengers: [
        { name: 'Ramesh Kumar', age: 34, gender: 'MALE', seatNumber: '1A' }
      ],
      seatNumbers: ['1A', '1B'] // 2 seats, 1 passenger
    };

    await expect(createBookingSchema.parseAsync(invalidData)).rejects.toThrow(
      'Number of passengers must match number of selected seats'
    );
  });

  it('should reject duplicate seats in the same booking request', async () => {
    const invalidData = {
      tripId: '507f1f77bcf86cd799439011',
      boardingStopId: '507f1f77bcf86cd799439012',
      droppingStopId: '507f1f77bcf86cd799439013',
      passengers: [
        { name: 'Ramesh Kumar', age: 34, gender: 'MALE', seatNumber: '1A' },
        { name: 'Duplicate Seat', age: 25, gender: 'MALE', seatNumber: '1A' }
      ],
      seatNumbers: ['1A', '1A']
    };

    await expect(createBookingSchema.parseAsync(invalidData)).rejects.toThrow(
      'Duplicate seats cannot be selected in the same booking'
    );
  });
});

