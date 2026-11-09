/**
 * Service for calculating journey fares and validating route stops.
 */

/**
 * Validates stop sequence in a route.
 * @param {Array} routeStops - Array of route stops [{ stopId, stopOrder, distanceKm }]
 * @param {string} boardingStopId - MongoDB ObjectId or string of boarding stop
 * @param {string} droppingStopId - MongoDB ObjectId or string of dropping stop
 * @returns {Object} { isValid, boardingIndex, droppingIndex, segmentDistanceKm, error }
 */
export const validateRouteStops = (routeStops, boardingStopId, droppingStopId) => {
  if (!Array.isArray(routeStops) || routeStops.length < 2) {
    return { isValid: false, error: 'Route must have at least two stops.' };
  }

  const bId = boardingStopId.toString();
  const dId = droppingStopId.toString();

  const boardingIndex = routeStops.findIndex(
    s => (s.stopId?._id?.toString() || s.stopId?.toString()) === bId
  );
  const droppingIndex = routeStops.findIndex(
    s => (s.stopId?._id?.toString() || s.stopId?.toString()) === dId
  );

  if (boardingIndex === -1) {
    return { isValid: false, error: 'Boarding stop does not belong to this route.' };
  }

  if (droppingIndex === -1) {
    return { isValid: false, error: 'Dropping stop does not belong to this route.' };
  }

  if (boardingIndex >= droppingIndex) {
    return {
      isValid: false,
      error: 'Boarding stop must occur before the dropping stop in the route sequence.'
    };
  }

  const boardingStop = routeStops[boardingIndex];
  const droppingStop = routeStops[droppingIndex];

  const boardingDist = boardingStop.distanceKm || 0;
  const droppingDist = droppingStop.distanceKm || 0;
  const segmentDistanceKm = Math.max(0, droppingDist - boardingDist);

  return {
    isValid: true,
    boardingIndex,
    droppingIndex,
    boardingStop,
    droppingStop,
    segmentDistanceKm
  };
};

/**
 * Calculates fare per passenger and total booking amount.
 * @param {Object} params
 * @param {number} params.baseFare - Trip base fare for full route
 * @param {number} params.totalRouteDistance - Total route distance in km
 * @param {number} params.segmentDistanceKm - Distance of passenger segment in km
 * @param {number} params.passengerCount - Number of passengers
 * @returns {Object} { perPassengerFare, baseFareTotal, gstAmount, serviceFee, totalAmount }
 */
export const calculateBookingFare = ({
  baseFare,
  totalRouteDistance = 100,
  segmentDistanceKm = 100,
  passengerCount = 1
}) => {
  if (baseFare <= 0) throw new Error('Base fare must be greater than zero.');
  if (passengerCount <= 0) throw new Error('Passenger count must be at least 1.');

  // Proportional ratio
  const ratio = totalRouteDistance > 0 ? segmentDistanceKm / totalRouteDistance : 1;
  // Floor ratio at 0.40 so min segment fare covers operational bus reservation overhead
  const effectiveRatio = Math.max(0.4, Math.min(1.0, ratio));

  const perPassengerBase = Math.round(baseFare * effectiveRatio);
  const baseFareTotal = perPassengerBase * passengerCount;

  // 5% transport GST and modest nominal platform fee (₹20 flat)
  const gstAmount = Math.round(baseFareTotal * 0.05);
  const serviceFee = 20;
  const totalAmount = baseFareTotal + gstAmount + serviceFee;

  return {
    perPassengerFare: perPassengerBase,
    passengerCount,
    baseFareTotal,
    gstAmount,
    serviceFee,
    totalAmount
  };
};

