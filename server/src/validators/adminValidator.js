import { z } from 'zod';

export const operatorSchema = z.object({
  name: z.string().trim().min(2, 'Operator name must be at least 2 characters'),
  operatorCode: z.string().trim().min(2).toUpperCase(),
  contactEmail: z.string().trim().email(),
  phone: z.string().trim().min(7),
  address: z.string().trim().optional().default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE')
});

export const busSchema = z.object({
  operatorId: z.string().min(1, 'Operator is required'),
  registrationNumber: z.string().trim().min(4).toUpperCase(),
  busType: z.string().min(2),
  totalSeats: z.coerce.number().int().min(10).max(60),
  amenities: z.array(z.string()).optional().default([]),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'INACTIVE']).optional().default('ACTIVE')
});

export const stopSchema = z.object({
  name: z.string().trim().min(2, 'Stop name is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  stopCode: z.string().trim().min(2).toUpperCase(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE')
});

export const routeSchema = z.object({
  routeName: z.string().trim().min(2, 'Route name is required'),
  routeCode: z.string().trim().min(2).toUpperCase(),
  stops: z.array(z.object({
    stopId: z.string().min(1, 'Stop ID is required'),
    stopOrder: z.number().int().min(0),
    distanceKm: z.number().min(0),
    timeOffsetMinutes: z.number().min(0).optional().default(0)
  })).min(2, 'Route must have at least 2 stops'),
  totalDistance: z.coerce.number().min(1, 'Total distance must be at least 1 km'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE')
});

export const tripSchema = z.object({
  routeId: z.string().min(1, 'Route is required'),
  busId: z.string().min(1, 'Bus is required'),
  operatorId: z.string().min(1, 'Operator is required'),
  departureAt: z.string().datetime().or(z.date()),
  arrivalAt: z.string().datetime().or(z.date()),
  baseFare: z.coerce.number().min(1, 'Base fare must be positive'),
  currency: z.string().optional().default('INR'),
  status: z.enum(['SCHEDULED', 'ON_ROUTE', 'COMPLETED', 'CANCELLED']).optional().default('SCHEDULED')
});

export const cancellationPolicySchema = z.object({
  policyName: z.string().trim().min(2),
  refundTiers: z.array(z.object({
    minHoursBeforeDeparture: z.coerce.number().min(0),
    refundPercentage: z.coerce.number().min(0).max(100)
  })).min(1, 'At least one refund tier is required'),
  active: z.boolean().optional().default(true)
});

