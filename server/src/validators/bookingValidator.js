import { z } from 'zod';

const passengerItemSchema = z.object({
  name: z.string().trim().min(2, 'Passenger name is required'),
  age: z.coerce.number().int().min(1, 'Age must be at least 1').max(120, 'Age must be realistic'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('OTHER'),
  seatNumber: z.string().trim().min(1, 'Seat number is required'),
  phone: z.string().trim().optional().default(''),
  email: z.string().trim().email().optional().or(z.literal('')).default('')
});

export const createBookingSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  boardingStopId: z.string().min(1, 'Boarding stop ID is required'),
  droppingStopId: z.string().min(1, 'Dropping stop ID is required'),
  passengers: z.array(passengerItemSchema).min(1, 'At least one passenger is required').max(6, 'Maximum 6 passengers per booking'),
  seatNumbers: z.array(z.string().trim().min(1)).min(1, 'At least one seat is required').max(6, 'Maximum 6 seats per booking')
}).refine((data) => {
  return data.passengers.length === data.seatNumbers.length;
}, {
  message: 'Number of passengers must match number of selected seats',
  path: ['seatNumbers']
}).refine((data) => {
  // Ensure unique seat numbers
  const uniqueSeats = new Set(data.seatNumbers);
  return uniqueSeats.size === data.seatNumbers.length;
}, {
  message: 'Duplicate seats cannot be selected in the same booking',
  path: ['seatNumbers']
}).refine((data) => {
  // Ensure every passenger's seat is in seatNumbers
  const seatSet = new Set(data.seatNumbers);
  return data.passengers.every(p => seatSet.has(p.seatNumber));
}, {
  message: 'Every passenger must be assigned one of the selected seats',
  path: ['passengers']
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().trim().optional().default('Cancelled by user')
});

