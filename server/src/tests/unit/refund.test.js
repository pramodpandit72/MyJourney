import { describe, it, expect } from 'vitest';
import { calculateRefund } from '../../services/refundService.js';
import { REFUND_STATUS } from '../../config/constants.js';

describe('Unit Tests: Cancellation Refund Calculation', () => {
  const baseNow = new Date('2026-11-10T10:00:00.000Z');
  const totalAmount = 1000;

  it('should grant 100% simulated refund when cancelled >= 24 hours before departure', () => {
    // Departure in 30 hours
    const departureAt = new Date(baseNow.getTime() + 30 * 60 * 60 * 1000);
    const result = calculateRefund({ departureAt, totalAmount, now: baseNow });

    expect(result.isEligible).toBe(true);
    expect(result.refundPercentage).toBe(100);
    expect(result.refundAmount).toBe(1000);
    expect(result.refundStatus).toBe(REFUND_STATUS.SIMULATED_PROCESSED);
  });

  it('should grant 50% simulated refund when cancelled between 6 and 24 hours before departure', () => {
    // Departure in 12 hours
    const departureAt = new Date(baseNow.getTime() + 12 * 60 * 60 * 1000);
    const result = calculateRefund({ departureAt, totalAmount, now: baseNow });

    expect(result.isEligible).toBe(true);
    expect(result.refundPercentage).toBe(50);
    expect(result.refundAmount).toBe(500);
    expect(result.refundStatus).toBe(REFUND_STATUS.SIMULATED_PROCESSED);
  });

  it('should grant 0% simulated refund when cancelled less than 6 hours before departure', () => {
    // Departure in 3 hours
    const departureAt = new Date(baseNow.getTime() + 3 * 60 * 60 * 1000);
    const result = calculateRefund({ departureAt, totalAmount, now: baseNow });

    expect(result.isEligible).toBe(true);
    expect(result.refundPercentage).toBe(0);
    expect(result.refundAmount).toBe(0);
    expect(result.refundStatus).toBe(REFUND_STATUS.NOT_ELIGIBLE);
  });

  it('should disallow cancellation after departure has passed', () => {
    // Trip departed 1 hour ago
    const departureAt = new Date(baseNow.getTime() - 1 * 60 * 60 * 1000);
    const result = calculateRefund({ departureAt, totalAmount, now: baseNow });

    expect(result.isEligible).toBe(false);
    expect(result.refundPercentage).toBe(0);
    expect(result.refundAmount).toBe(0);
    expect(result.refundStatus).toBe(REFUND_STATUS.NOT_ELIGIBLE);
    expect(result.reason).toContain('not permitted after the trip has departed');
  });

  it('should honor custom configurable policy tiers', () => {
    const customPolicy = {
      refundTiers: [
        { minHoursBeforeDeparture: 48, refundPercentage: 100 },
        { minHoursBeforeDeparture: 12, refundPercentage: 70 },
        { minHoursBeforeDeparture: 2, refundPercentage: 20 },
        { minHoursBeforeDeparture: 0, refundPercentage: 0 }
      ]
    };

    // 15 hours before departure -> matches minHoursBeforeDeparture: 12 (70%)
    const departureAt = new Date(baseNow.getTime() + 15 * 60 * 60 * 1000);
    const result = calculateRefund({ departureAt, totalAmount: 2000, policy: customPolicy, now: baseNow });

    expect(result.refundPercentage).toBe(70);
    expect(result.refundAmount).toBe(1400);
  });
});

