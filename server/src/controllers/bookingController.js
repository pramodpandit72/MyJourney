import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import SeatInventory from '../models/SeatInventory.js';
import { createBooking, cancelBooking, BookingConflictError, BookingValidationError } from '../services/bookingService.js';
import { validateRouteStops, calculateBookingFare } from '../services/fareService.js';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpayService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { USER_ROLES, PAYMENT_STATUS } from '../config/constants.js';

export const getPaymentConfig = (req, res) => {
  return sendSuccess(res, {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    enabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
};

export const handleCreatePaymentOrder = async (req, res, next) => {
  try {
    const { tripId, boardingStopId, droppingStopId, passengers, seatNumbers } = req.body;
    const userId = req.user._id;

    // 1. Validate trip
    const trip = await Trip.findById(tripId).populate('routeId');
    if (!trip) {
      return sendError(res, 'Trip not found or no longer available.', 404, 'TRIP_NOT_FOUND');
    }
    if (trip.status !== 'SCHEDULED') {
      return sendError(res, `Trip is not open for booking (status: ${trip.status}).`, 400, 'TRIP_NOT_BOOKABLE');
    }
    if (new Date(trip.departureAt).getTime() <= Date.now()) {
      return sendError(res, 'Trip has already departed. Bookings are closed.', 400, 'TRIP_DEPARTED');
    }

    // 2. Validate route stops
    const routeValidation = validateRouteStops(trip.routeId.stops, boardingStopId, droppingStopId);
    if (!routeValidation.isValid) {
      return sendError(res, routeValidation.error, 400, 'INVALID_ROUTE_STOPS');
    }

    // 3. Check seat availability in SeatInventory
    const availableSeats = await SeatInventory.find({
      tripId,
      seatNumber: { $in: seatNumbers },
      status: 'AVAILABLE'
    });

    if (availableSeats.length !== seatNumbers.length) {
      const foundNumbers = new Set(availableSeats.map(s => s.seatNumber));
      const unavailable = seatNumbers.filter(num => !foundNumbers.has(num));
      return sendError(res, `One or more selected seats (${unavailable.join(', ')}) are no longer available.`, 409, 'SEAT_UNAVAILABLE', { conflictingSeats: unavailable });
    }

    // 4. Calculate fare
    const fareResult = calculateBookingFare({
      baseFare: trip.baseFare,
      totalRouteDistance: trip.routeId.totalDistance,
      segmentDistanceKm: routeValidation.segmentDistanceKm,
      passengerCount: passengers.length
    });

    // 5. Create Razorpay order
    const orderData = await createRazorpayOrder({
      amountInRupees: fareResult.totalAmount,
      receipt: `bkg_${Date.now()}`.slice(0, 40),
      notes: {
        tripId: tripId.toString(),
        userId: userId.toString(),
        seatNumbers: seatNumbers.join(',')
      }
    });

    return sendSuccess(res, {
      ...orderData,
      totalAmount: fareResult.totalAmount,
      fareBreakdown: fareResult
    }, 'Razorpay payment order initialized');
  } catch (err) {
    next(err);
  }
};

export const handleVerifyPaymentAndBook = async (req, res, next) => {
  try {
    const {
      tripId,
      boardingStopId,
      droppingStopId,
      passengers,
      seatNumbers,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const userId = req.user._id;

    // 1. Verify Razorpay cryptographic signature
    const isValidSignature = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValidSignature) {
      return sendError(res, 'Razorpay payment verification failed: Invalid cryptographic signature.', 400, 'PAYMENT_SIGNATURE_INVALID');
    }

    // 2. Complete booking atomically
    const booking = await createBooking({
      userId,
      tripId,
      boardingStopId,
      droppingStopId,
      passengers,
      seatNumbers,
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentMethod: 'RAZORPAY_TEST',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    return sendSuccess(
      res,
      { booking },
      `Payment verified and booking confirmed with PNR: ${booking.pnr}`,
      201
    );
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

