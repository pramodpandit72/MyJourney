import { REFUND_STATUS } from '../config/constants.js';

/**
 * Calculates refund amount and percentage based on departure time and active policy.
 * @param {Object} params
 * @param {Date|string} params.departureAt - Trip departure timestamp
 * @param {number} params.totalAmount - Total booking amount paid
 * @param {Object} [params.policy] - Active CancellationPolicy model document or plain object
 * @param {Date} [params.now] - Current timestamp (useful for deterministic unit testing)
 * @returns {Object} { isEligible, refundPercentage, refundAmount, hoursRemaining, refundStatus, reason }
 */
export const calculateRefund = ({ departureAt, totalAmount, policy, now = new Date() }) => {
  const departureTime = new Date(departureAt).getTime();
  const currentTime = new Date(now).getTime();
  const diffHours = (departureTime - currentTime) / (1000 * 60 * 60);

  // If already departed or currently departing
  if (diffHours <= 0) {
    return {
      isEligible: false,
      refundPercentage: 0,
      refundAmount: 0,
      hoursRemaining: Math.max(0, diffHours),
      refundStatus: REFUND_STATUS.NOT_ELIGIBLE,
      reason: 'Cancellation is not permitted after the trip has departed.'
    };
  }

  // Default refund tiers if policy is not provided or empty
  // Sorted from highest hours threshold to lowest
  const tiers = (policy && policy.refundTiers && policy.refundTiers.length > 0)
    ? [...policy.refundTiers].sort((a, b) => b.minHoursBeforeDeparture - a.minHoursBeforeDeparture)
    : [
        { minHoursBeforeDeparture: 24, refundPercentage: 100 },
        { minHoursBeforeDeparture: 6, refundPercentage: 50 },
        { minHoursBeforeDeparture: 0, refundPercentage: 0 }
      ];

  let applicableTier = null;
  for (const tier of tiers) {
    if (diffHours >= tier.minHoursBeforeDeparture) {
      applicableTier = tier;
      break;
    }
  }

  const refundPercentage = applicableTier ? applicableTier.refundPercentage : 0;
  const refundAmount = Math.round((totalAmount * refundPercentage) / 100);
  const refundStatus = refundPercentage > 0 ? REFUND_STATUS.SIMULATED_PROCESSED : REFUND_STATUS.NOT_ELIGIBLE;

  return {
    isEligible: true, // cancellation itself is allowed before departure
    refundPercentage,
    refundAmount,
    hoursRemaining: Number(diffHours.toFixed(2)),
    refundStatus,
    reason: refundPercentage > 0
      ? `Eligible for ${refundPercentage}% simulated refund based on ${diffHours.toFixed(1)} hours before departure.`
      : `0% refund applies as cancellation is within ${tiers[tiers.length - 1]?.minHoursBeforeDeparture || 6} hours of departure.`
  };
};

