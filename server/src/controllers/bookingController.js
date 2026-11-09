import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import { createBooking, cancelBooking, BookingConflictError, BookingValidationError } from '../services/bookingService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { USER_ROLES } from '../config/constants.js';

export const handleCreateBooking = async (req, res, next) => {
  try {
    const { tripId, boardingStopId, droppingStopId, passengers, seatNumbers } = req.body;
    const userId = req.user._id;

    const booking = await createBooking({
      userId,
      tripId,
      boardingStopId,
      droppingStopId,
      passengers,
      seatNumbers
    });

    return sendSuccess(res, { booking }, 'Booking confirmed successfully with PNR: ' + booking.pnr, 201);
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return sendError(res, err.message, 409, err.code, { conflictingSeats: err.conflictingSeats });
    }
    if (err instanceof BookingValidationError) {
      return sendError(res, err.message, err.statusCode, err.code);
    }
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user._id };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('boardingStopId', 'name city state stopCode')
      .populate('droppingStopId', 'name city state stopCode')
      .populate({
        path: 'tripId',
        populate: [
          { path: 'routeId', select: 'routeName routeCode totalDistance' },
          { path: 'busId', select: 'registrationNumber busType amenities' },
          { path: 'operatorId', select: 'name operatorCode phone' }
        ]
      })
      .sort({ bookingDate: -1 });

    return sendSuccess(res, { bookings, count: bookings.length });
  } catch (err) {
    next(err);
  }
};

export const getBookingByPNR = async (req, res, next) => {
  try {
    const { pnr } = req.params;

    const booking = await Booking.findOne({ pnr: pnr.toUpperCase() })
      .populate('userId', 'name email phone')
      .populate('boardingStopId', 'name city state stopCode')
      .populate('droppingStopId', 'name city state stopCode')
      .populate({
        path: 'tripId',
        populate: [
          { path: 'routeId' },
          { path: 'busId' },
          { path: 'operatorId' }
        ]
      });

    if (!booking) {
      return sendError(res, 'Booking with this PNR was not found', 404, 'PNR_NOT_FOUND');
    }

    // Role-based privacy check:
    // 1. Admin can view any booking
    // 2. Customer can only view their OWN booking
    // 3. Operator can only view booking if the trip's operatorId matches their operatorId
    if (req.user.role === USER_ROLES.CUSTOMER) {
      if (booking.userId._id.toString() !== req.user._id.toString()) {
        return sendError(res, 'Access denied. You cannot view another customer’s private ticket.', 403, 'FORBIDDEN');
      }
    } else if (req.user.role === USER_ROLES.OPERATOR) {
      const tripOperatorId = booking.tripId?.operatorId?._id?.toString() || booking.tripId?.operatorId?.toString();
      if (!req.user.operatorId || tripOperatorId !== req.user.operatorId.toString()) {
        return sendError(res, 'Access denied. This booking does not belong to your assigned bus service.', 403, 'FORBIDDEN');
      }
    }

    return sendSuccess(res, { booking });
  } catch (err) {
    next(err);
  }
};

export const handleCancelBooking = async (req, res, next) => {
  try {
    const { pnr } = req.params;
    const { cancellationReason } = req.body || {};

    const result = await cancelBooking({
      pnr: pnr.toUpperCase(),
      user: req.user,
      cancellationReason
    });

    return sendSuccess(
      res,
      result,
      `Booking ${result.booking.pnr} has been cancelled successfully. Simulated refund: ₹${result.refundInfo.refundAmount}.`
    );
  } catch (err) {
    if (err instanceof BookingValidationError) {
      return sendError(res, err.message, err.statusCode, err.code);
    }
    next(err);
  }
};

