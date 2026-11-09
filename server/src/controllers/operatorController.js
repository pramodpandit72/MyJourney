import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Booking from '../models/Booking.js';
import SeatInventory from '../models/SeatInventory.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { BOOKING_STATUS, SEAT_STATUS } from '../config/constants.js';

export const getOperatorDashboard = async (req, res, next) => {
  try {
    const operatorId = req.user.operatorId;
    if (!operatorId) {
      return sendError(res, 'No operator associated with this account.', 403, 'NO_OPERATOR_ASSIGNED');
    }

    const assignedTrips = await Trip.find({ operatorId });
    const tripIds = assignedTrips.map(t => t._id);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todaysTripsCount = await Trip.countDocuments({
      operatorId,
      departureAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const upcomingTripsCount = await Trip.countDocuments({
      operatorId,
      departureAt: { $gte: now },
      status: 'SCHEDULED'
    });

    // Confirmed bookings for operator's trips
    const confirmedBookings = await Booking.find({
      tripId: { $in: tripIds },
      status: BOOKING_STATUS.CONFIRMED
    });

    let totalConfirmedPassengers = 0;
    for (const b of confirmedBookings) {
      totalConfirmedPassengers += b.passengers.length;
    }

    const cancelledBookingsCount = await Booking.countDocuments({
      tripId: { $in: tripIds },
      status: BOOKING_STATUS.CANCELLED
    });

    // Seat inventory occupancy
    const totalInventorySeats = await SeatInventory.countDocuments({ tripId: { $in: tripIds } });
    const bookedInventorySeats = await SeatInventory.countDocuments({
      tripId: { $in: tripIds },
      status: SEAT_STATUS.BOOKED
    });

    const occupancyRate = totalInventorySeats > 0
      ? Math.round((bookedInventorySeats / totalInventorySeats) * 100)
      : 0;

    return sendSuccess(res, {
      summary: {
        assignedTripsCount: assignedTrips.length,
        todaysTripsCount,
        upcomingTripsCount,
        totalConfirmedPassengers,
        cancelledBookingsCount,
        totalInventorySeats,
        bookedInventorySeats,
        occupancyRate
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getOperatorTrips = async (req, res, next) => {
  try {
    const operatorId = req.user.operatorId;
    if (!operatorId) {
      return sendError(res, 'No operator assigned to this account', 403, 'NO_OPERATOR_ASSIGNED');
    }

    const { date, status, routeId } = req.query;
    const filter = { operatorId };

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (routeId && mongoose.Types.ObjectId.isValid(routeId)) {
      filter.routeId = routeId;
    }
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      filter.departureAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const trips = await Trip.find(filter)
      .populate('routeId')
      .populate('busId')
      .sort({ departureAt: -1 });

    // Enrich trips with real-time seat occupancy count
    const enrichedTrips = await Promise.all(
      trips.map(async trip => {
        const total = trip.busId?.totalSeats || 0;
        const booked = await SeatInventory.countDocuments({ tripId: trip._id, status: SEAT_STATUS.BOOKED });
        return {
          ...trip.toObject(),
          totalSeats: total,
          bookedSeats: booked,
          availableSeats: Math.max(0, total - booked),
          occupancyPercentage: total > 0 ? Math.round((booked / total) * 100) : 0
        };
      })
    );

    return sendSuccess(res, { trips: enrichedTrips });
  } catch (err) {
    next(err);
  }
};

export const getPassengerManifest = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const operatorId = req.user.operatorId;

    const trip = await Trip.findById(tripId)
      .populate('routeId')
      .populate('busId')
      .populate('operatorId');

    if (!trip) {
      return sendError(res, 'Trip not found', 404, 'TRIP_NOT_FOUND');
    }

    // Role check: Operator must be assigned to THIS trip!
    if (req.user.role === 'OPERATOR') {
      if (!operatorId || trip.operatorId._id.toString() !== operatorId.toString()) {
        return sendError(res, 'Access denied. You cannot view manifests for other operators’ trips.', 403, 'FORBIDDEN');
      }
    }

    // Fetch confirmed bookings for this trip
    const confirmedBookings = await Booking.find({
      tripId: trip._id,
      status: BOOKING_STATUS.CONFIRMED
    })
      .populate('boardingStopId', 'name city stopCode')
      .populate('droppingStopId', 'name city stopCode')
      .sort({ bookingDate: 1 });

    const manifestEntries = [];
    for (const b of confirmedBookings) {
      for (const p of b.passengers) {
        manifestEntries.push({
          pnr: b.pnr,
          passengerName: p.name,
          age: p.age,
          gender: p.gender,
          seatNumber: p.seatNumber,
          phone: p.phone || b.userId?.phone || 'N/A',
          boardingStop: b.boardingStopId?.name || 'N/A',
          droppingStop: b.droppingStopId?.name || 'N/A',
          bookingStatus: b.status,
          bookingDate: b.bookingDate
        });
      }
    }

    // Sort manifest by seatNumber
    manifestEntries.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }));

    // Occupancy metrics
    const totalSeats = trip.busId?.totalSeats || 0;
    const confirmedCount = manifestEntries.length;
    const occupancyPercentage = totalSeats > 0 ? Math.round((confirmedCount / totalSeats) * 100) : 0;

    return sendSuccess(res, {
      trip: {
        _id: trip._id,
        routeName: trip.routeId?.routeName,
        busRegistration: trip.busId?.registrationNumber,
        busType: trip.busId?.busType,
        departureAt: trip.departureAt,
        arrivalAt: trip.arrivalAt,
        status: trip.status
      },
      manifest: manifestEntries,
      stats: {
        totalSeats,
        confirmedCount,
        availableSeats: Math.max(0, totalSeats - confirmedCount),
        occupancyPercentage
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getOccupancyReport = async (req, res, next) => {
  try {
    const operatorId = req.user.operatorId;
    if (!operatorId) {
      return sendError(res, 'No operator assigned', 403, 'NO_OPERATOR_ASSIGNED');
    }

    const trips = await Trip.find({ operatorId })
      .populate('routeId', 'routeName routeCode')
      .populate('busId', 'registrationNumber totalSeats busType')
      .sort({ departureAt: -1 });

    const reports = await Promise.all(
      trips.map(async trip => {
        const totalSeats = trip.busId?.totalSeats || 0;
        const bookedCount = await SeatInventory.countDocuments({
          tripId: trip._id,
          status: SEAT_STATUS.BOOKED
        });

        return {
          tripId: trip._id,
          route: trip.routeId?.routeName || 'N/A',
          busNumber: trip.busId?.registrationNumber || 'N/A',
          busType: trip.busId?.busType || 'N/A',
          departureAt: trip.departureAt,
          totalSeats,
          confirmedSeats: bookedCount,
          availableSeats: Math.max(0, totalSeats - bookedCount),
          occupancyPercentage: totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0,
          status: trip.status
        };
      })
    );

    return sendSuccess(res, { reports });
  } catch (err) {
    next(err);
  }
};

