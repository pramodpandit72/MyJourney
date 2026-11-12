import mongoose from 'mongoose';
import Stop from '../models/Stop.js';
import Trip from '../models/Trip.js';
import Route from '../models/Route.js';
import SeatInventory from '../models/SeatInventory.js';
import { getDayRangeInAsiaKolkata, calculateDuration } from '../utils/dateUtils.js';
import { validateRouteStops, calculateBookingFare } from '../services/fareService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { SEAT_STATUS } from '../config/constants.js';

export const getStops = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { status: 'ACTIVE' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { stopCode: { $regex: search, $options: 'i' } }
      ];
    }

    const stops = await Stop.find(filter).sort({ city: 1, name: 1 });
    return sendSuccess(res, { stops });
  } catch (err) {
    next(err);
  }
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findMatchingStopIds = async (rawQuery) => {
  const cleaned = String(rawQuery || '').trim();
  if (!cleaned) return [];

  const parts = cleaned
    .split(/[—,-]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const orConditions = [
    { city: { $regex: escapeRegex(cleaned), $options: 'i' } },
    { name: { $regex: escapeRegex(cleaned), $options: 'i' } },
    { stopCode: { $regex: escapeRegex(cleaned), $options: 'i' } },
    { state: { $regex: escapeRegex(cleaned), $options: 'i' } }
  ];

  if (parts.length > 1) {
    const andMatch = parts.map((part) => {
      const rx = escapeRegex(part);
      return {
        $or: [
          { city: { $regex: rx, $options: 'i' } },
          { name: { $regex: rx, $options: 'i' } },
          { stopCode: { $regex: rx, $options: 'i' } },
          { state: { $regex: rx, $options: 'i' } }
        ]
      };
    });
    orConditions.push({ $and: andMatch });
  }

  const matched = await Stop.find({ status: 'ACTIVE', $or: orConditions }).select('_id');
  return matched.map((s) => s._id.toString());
};

export const searchTrips = async (req, res, next) => {
  try {
    const {
      originStopId: origId,
      sourceStopId,
      destinationStopId,
      originQuery,
      destinationQuery,
      travelDate,
      busType,
      operatorId,
      sortBy = 'departureAt',
      order = 'asc'
    } = req.query;

    const originStopId = origId || sourceStopId;

    let candidateOriginIds = null;
    let candidateDestinationIds = null;

    if (originStopId) {
      candidateOriginIds = [originStopId];
    } else if (originQuery && originQuery.trim()) {
      candidateOriginIds = await findMatchingStopIds(originQuery);
      if (candidateOriginIds.length === 0) {
        return sendSuccess(res, { trips: [], count: 0, travelDate });
      }
    }

    if (destinationStopId) {
      candidateDestinationIds = [destinationStopId];
    } else if (destinationQuery && destinationQuery.trim()) {
      candidateDestinationIds = await findMatchingStopIds(destinationQuery);
      if (candidateDestinationIds.length === 0) {
        return sendSuccess(res, { trips: [], count: 0, travelDate });
      }
    }

    // Build base trip query
    const tripQuery = {
      status: 'SCHEDULED'
    };

    if (travelDate) {
      const { startOfDay, endOfDay } = getDayRangeInAsiaKolkata(travelDate);
      tripQuery.departureAt = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default to upcoming trips from today onwards
      tripQuery.departureAt = { $gte: new Date(Date.now() - 24 * 3600 * 1000) };
    }

    if (operatorId && mongoose.Types.ObjectId.isValid(operatorId)) {
      tripQuery.operatorId = operatorId;
    }

    // Find candidate trips populated with Route, Bus, and Operator
    const trips = await Trip.find(tripQuery)
      .populate('routeId')
      .populate('busId')
      .populate('operatorId')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    // Filter by route stops ordering (origin before destination) if specified
    const matchedTrips = [];

    for (const trip of trips) {
      if (!trip.routeId || !trip.busId || !trip.operatorId) continue;
      if (trip.busId.status === 'INACTIVE' || trip.operatorId.status === 'INACTIVE') continue;

      if (busType && trip.busId.busType !== busType) continue;

      const routeStops = trip.routeId.stops || [];

      let boardingStop = null;
      let droppingStop = null;
      let segmentDistanceKm = trip.routeId.totalDistance;

      if (candidateOriginIds && candidateDestinationIds) {
        let validSegment = null;
        for (const oId of candidateOriginIds) {
          for (const dId of candidateDestinationIds) {
            if (oId === dId) continue;
            const routeValidation = validateRouteStops(routeStops, oId, dId);
            if (routeValidation.isValid) {
              validSegment = routeValidation;
              break;
            }
          }
          if (validSegment) break;
        }
        if (!validSegment) {
          // Trip does not serve this exact sequence
          continue;
        }
        boardingStop = validSegment.boardingStop;
        droppingStop = validSegment.droppingStop;
        segmentDistanceKm = validSegment.segmentDistanceKm;
      } else if (candidateOriginIds) {
        const matchOrigin = routeStops.find((rs) =>
          candidateOriginIds.includes((rs.stopId?._id || rs.stopId)?.toString())
        );
        if (!matchOrigin || matchOrigin.stopOrder >= routeStops[routeStops.length - 1]?.stopOrder) {
          continue;
        }
        boardingStop = matchOrigin;
        droppingStop = routeStops[routeStops.length - 1];
        segmentDistanceKm = Math.max(0, (droppingStop.distanceKm || 0) - (boardingStop.distanceKm || 0));
      } else if (candidateDestinationIds) {
        const matchDest = routeStops.find((rs) =>
          candidateDestinationIds.includes((rs.stopId?._id || rs.stopId)?.toString())
        );
        if (!matchDest || matchDest.stopOrder <= routeStops[0]?.stopOrder) {
          continue;
        }
        boardingStop = routeStops[0];
        droppingStop = matchDest;
        segmentDistanceKm = Math.max(0, (droppingStop.distanceKm || 0) - (boardingStop.distanceKm || 0));
      } else {
        // Full route defaults
        boardingStop = routeStops[0];
        droppingStop = routeStops[routeStops.length - 1];
      }

      // Check seat availability
      const totalSeats = trip.busId.totalSeats;
      const bookedSeatsCount = await SeatInventory.countDocuments({
        tripId: trip._id,
        status: SEAT_STATUS.BOOKED
      });
      const availableSeatsCount = Math.max(0, totalSeats - bookedSeatsCount);

      // Calculate fare for this segment
      const fareInfo = calculateBookingFare({
        baseFare: trip.baseFare,
        totalRouteDistance: trip.routeId.totalDistance,
        segmentDistanceKm,
        passengerCount: 1
      });

      matchedTrips.push({
        _id: trip._id,
        route: {
          _id: trip.routeId._id,
          routeName: trip.routeId.routeName,
          routeCode: trip.routeId.routeCode,
          totalDistance: trip.routeId.totalDistance
        },
        operator: {
          _id: trip.operatorId._id,
          name: trip.operatorId.name,
          operatorCode: trip.operatorId.operatorCode
        },
        bus: {
          _id: trip.busId._id,
          registrationNumber: trip.busId.registrationNumber,
          busType: trip.busId.busType,
          amenities: trip.busId.amenities || []
        },
        departureAt: trip.departureAt,
        arrivalAt: trip.arrivalAt,
        duration: calculateDuration(trip.departureAt, trip.arrivalAt),
        totalSeats,
        bookedSeatsCount,
        availableSeatsCount,
        farePerPassenger: fareInfo.perPassengerFare,
        baseFare: trip.baseFare,
        boardingStop,
        droppingStop,
        status: trip.status
      });
    }

    return sendSuccess(res, {
      trips: matchedTrips,
      count: matchedTrips.length,
      travelDate
    });
  } catch (err) {
    next(err);
  }
};

export const getTripDetails = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId)
      .populate({
        path: 'routeId',
        populate: { path: 'stops.stopId' }
      })
      .populate('busId')
      .populate('operatorId');

    if (!trip) {
      return sendError(res, 'Trip not found', 404, 'TRIP_NOT_FOUND');
    }

    const bookedSeats = await SeatInventory.find({
      tripId: trip._id,
      status: SEAT_STATUS.BOOKED
    }).select('seatNumber');

    const bookedSeatNumbers = bookedSeats.map(s => s.seatNumber);
    const totalSeats = trip.busId.totalSeats;
    const availableSeatsCount = Math.max(0, totalSeats - bookedSeatNumbers.length);

    return sendSuccess(res, {
      trip: {
        _id: trip._id,
        route: trip.routeId,
        bus: trip.busId,
        operator: trip.operatorId,
        departureAt: trip.departureAt,
        arrivalAt: trip.arrivalAt,
        duration: calculateDuration(trip.departureAt, trip.arrivalAt),
        baseFare: trip.baseFare,
        totalSeats,
        availableSeatsCount,
        bookedSeatNumbers,
        status: trip.status
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getTripSeats = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId).populate('busId');
    if (!trip) {
      return sendError(res, 'Trip not found', 404, 'TRIP_NOT_FOUND');
    }

    const bus = trip.busId;
    if (!bus) {
      return sendError(res, 'Bus configuration not found', 404, 'BUS_NOT_FOUND');
    }

    // Get current seat inventory status for all seats of this trip
    const inventoryRecords = await SeatInventory.find({ tripId });
    const inventoryMap = new Map();
    for (const record of inventoryRecords) {
      inventoryMap.set(record.seatNumber, record.status);
    }

    const seatsLayout = bus.seatLayout?.seats || [];
    const mappedSeats = seatsLayout.map(seat => {
      const currentStatus = inventoryMap.get(seat.seatNumber) || SEAT_STATUS.AVAILABLE;
      return {
        seatNumber: seat.seatNumber,
        row: seat.row,
        col: seat.col,
        deck: seat.deck || 'LOWER',
        type: seat.type || 'SEATER',
        status: currentStatus,
        isBooked: currentStatus === SEAT_STATUS.BOOKED
      };
    });

    return sendSuccess(res, {
      layoutType: bus.seatLayout?.layoutType || '2+2',
      rows: bus.seatLayout?.rows || 10,
      columns: bus.seatLayout?.columns || 4,
      hasUpperDeck: bus.seatLayout?.hasUpperDeck || false,
      totalSeats: bus.totalSeats,
      seats: mappedSeats
    });
  } catch (err) {
    next(err);
  }
};

