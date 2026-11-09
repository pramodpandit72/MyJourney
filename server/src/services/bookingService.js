import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import SeatInventory from '../models/SeatInventory.js';
import Trip from '../models/Trip.js';
import CancellationPolicy from '../models/CancellationPolicy.js';
import { generatePNR } from '../utils/pnrGenerator.js';
import { validateRouteStops, calculateBookingFare } from './fareService.js';
import { calculateRefund } from './refundService.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { BOOKING_STATUS, SEAT_STATUS, PAYMENT_STATUS, USER_ROLES } from '../config/constants.js';

export class BookingConflictError extends Error {
  constructor(message, conflictingSeats = []) {
    super(message);
    this.name = 'BookingConflictError';
    this.statusCode = 409;
    this.code = 'SEAT_UNAVAILABLE';
    this.conflictingSeats = conflictingSeats;
  }
}

export class BookingValidationError extends Error {
  constructor(message, statusCode = 400, code = 'INVALID_BOOKING') {
    super(message);
    this.name = 'BookingValidationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Creates a new booking with ACID transaction and strict seat availability checks.
 */
export const createBooking = async ({
  userId,
  tripId,
  boardingStopId,
  droppingStopId,
  passengers,
  seatNumbers
}) => {
  // 1. Fetch and validate Trip along with Route
  const trip = await Trip.findById(tripId).populate('routeId').populate('busId').populate('operatorId');
  if (!trip) {
    throw new BookingValidationError('Trip not found or no longer available.', 404, 'TRIP_NOT_FOUND');
  }

  if (trip.status !== 'SCHEDULED') {
    throw new BookingValidationError(`Trip is not open for booking (status: ${trip.status}).`, 400, 'TRIP_NOT_BOOKABLE');
  }

  // Check if departure has already passed
  if (new Date(trip.departureAt).getTime() <= Date.now()) {
    throw new BookingValidationError('Trip has already departed. Bookings are closed.', 400, 'TRIP_DEPARTED');
  }

  // 2. Validate route stops ordering and presence
  const routeValidation = validateRouteStops(trip.routeId.stops, boardingStopId, droppingStopId);
  if (!routeValidation.isValid) {
    throw new BookingValidationError(routeValidation.error, 400, 'INVALID_ROUTE_STOPS');
  }

  // 3. Calculate fare
  const fareResult = calculateBookingFare({
    baseFare: trip.baseFare,
    totalRouteDistance: trip.routeId.totalDistance,
    segmentDistanceKm: routeValidation.segmentDistanceKm,
    passengerCount: passengers.length
  });

  // 4. Check if replica-set is supported for transaction
  const session = await mongoose.startSession();
  let bookingResult = null;

  try {
    // Check if session supports transactions (replica set)
    let hasTransaction = false;
    try {
      session.startTransaction();
      hasTransaction = true;
    } catch (e) {
      // Standalone mongod might not support replica set
      hasTransaction = false;
    }

    const sessionOption = hasTransaction ? { session } : {};

    // 5. Verify all requested seats exist in inventory for this trip
    const existingSeats = await SeatInventory.find({
      tripId,
      seatNumber: { $in: seatNumbers }
    }).session(hasTransaction ? session : null);

    // If seats haven't been seeded yet in SeatInventory, initialize them
    if (existingSeats.length < seatNumbers.length) {
      // Find missing seats
      const foundSeatNumbers = new Set(existingSeats.map(s => s.seatNumber));
      const missingSeats = seatNumbers.filter(sn => !foundSeatNumbers.has(sn));

      // Check that seat number is valid for the bus layout
      const busSeats = trip.busId?.seatLayout?.seats || [];
      const validBusSeatNumbers = new Set(busSeats.map(s => s.seatNumber));

      for (const seatNum of missingSeats) {
        if (validBusSeatNumbers.size > 0 && !validBusSeatNumbers.has(seatNum)) {
          throw new BookingValidationError(`Seat ${seatNum} does not exist on this bus.`, 400, 'INVALID_SEAT_NUMBER');
        }
        // Create initial available seat
        await SeatInventory.create([{
          tripId,
          seatNumber: seatNum,
          status: SEAT_STATUS.AVAILABLE
        }], sessionOption);
      }
    }

    // 6. ATOMIC CLAIM: Try to claim each seat conditionally where status === AVAILABLE
    const claimedSeats = [];
    const conflictingSeats = [];

    for (const seatNum of seatNumbers) {
      const updatedSeat = await SeatInventory.findOneAndUpdate(
        {
          tripId,
          seatNumber: seatNum,
          status: SEAT_STATUS.AVAILABLE
        },
        {
          $set: {
            status: SEAT_STATUS.BOOKED
          }
        },
        {
          ...sessionOption,
          new: true
        }
      );

      if (!updatedSeat) {
        conflictingSeats.push(seatNum);
      } else {
        claimedSeats.push(updatedSeat);
      }
    }

    // 7. If any seat failed to be claimed, rollback immediately!
    if (conflictingSeats.length > 0) {
      // In standalone mode where no replica set transaction is active, release already claimed seats
      if (!hasTransaction && claimedSeats.length > 0) {
        await SeatInventory.updateMany(
          {
            _id: { $in: claimedSeats.map(s => s._id) }
          },
          {
            $set: { status: SEAT_STATUS.AVAILABLE, bookingId: null }
          }
        );
      }

      if (hasTransaction) {
        await session.abortTransaction();
      }

      throw new BookingConflictError(
        `One or more requested seats (${conflictingSeats.join(', ')}) have already been booked by another passenger.`,
        conflictingSeats
      );
    }

    // 8. Generate unique PNR
    let pnr = generatePNR();
    let pnrExists = await Booking.findOne({ pnr }).session(hasTransaction ? session : null);
    while (pnrExists) {
      pnr = generatePNR();
      pnrExists = await Booking.findOne({ pnr }).session(hasTransaction ? session : null);
    }

    // 9. Create the Booking document
    const newBooking = new Booking({
      pnr,
      userId,
      tripId,
      boardingStopId,
      droppingStopId,
      passengers,
      seatNumbers,
      fareBreakdown: {
        perPassengerFare: fareResult.perPassengerFare,
        baseFareTotal: fareResult.baseFareTotal,
        gstAmount: fareResult.gstAmount,
        serviceFee: fareResult.serviceFee
      },
      totalAmount: fareResult.totalAmount,
      status: BOOKING_STATUS.CONFIRMED,
      paymentStatus: PAYMENT_STATUS.SIMULATED_SUCCESS,
      bookingDate: new Date()
    });

    await newBooking.save(sessionOption);

    // 10. Link bookingId to claimed seats
    await SeatInventory.updateMany(
      {
        _id: { $in: claimedSeats.map(s => s._id) }
      },
      {
        $set: { bookingId: newBooking._id }
      },
      sessionOption
    );

    // 11. Create audit log
    await logAuditEvent({
      actorId: userId,
      actorRole: USER_ROLES.CUSTOMER,
      action: 'BOOKING_CONFIRMED',
      entityType: 'Booking',
      entityId: newBooking._id,
      summary: `Booking confirmed with PNR ${pnr} for ${passengers.length} passenger(s) on trip ${trip._id}. Total: ₹${fareResult.totalAmount}.`,
      details: {
        pnr,
        tripId,
        seatNumbers,
        totalAmount: fareResult.totalAmount
      }
    }, hasTransaction ? session : null);

    // 12. Commit transaction
    if (hasTransaction) {
      await session.commitTransaction();
    }

    bookingResult = await Booking.findById(newBooking._id)
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

    return bookingResult;
  } catch (err) {
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {}
    }

    // Handle MongoDB WriteConflict, TransientTransactionError, or duplicate key on concurrent race conditions
    if (
      err.code === 112 ||
      err.code === 11000 ||
      err.errorResponse?.code === 112 ||
      err.errorResponse?.code === 11000 ||
      (err.errorLabels && err.errorLabels.has && err.errorLabels.has('TransientTransactionError')) ||
      (Array.isArray(err.errorLabels) && err.errorLabels.includes('TransientTransactionError'))
    ) {
      throw new BookingConflictError(
        'One or more requested seats have already been claimed by another passenger.',
        seatNumbers
      );
    }

    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Cancels a booking, releases seats atomically, and calculates simulated refund.
 */
export const cancelBooking = async ({ pnr, user, cancellationReason = 'Cancelled by passenger' }) => {
  const booking = await Booking.findOne({ pnr })
    .populate('tripId')
    .populate('userId', 'name email');

  if (!booking) {
    throw new BookingValidationError('Booking not found with the provided PNR.', 404, 'BOOKING_NOT_FOUND');
  }

  // Authorization check: Customer can only cancel their own booking; Admin can cancel any
  if (user.role === USER_ROLES.CUSTOMER && booking.userId._id.toString() !== user._id.toString()) {
    throw new BookingValidationError('Unauthorized: You can only cancel your own bookings.', 403, 'FORBIDDEN');
  }

  // Operator cannot cancel customer bookings unless admin
  if (user.role === USER_ROLES.OPERATOR) {
    throw new BookingValidationError('Operators cannot cancel passenger bookings directly.', 403, 'FORBIDDEN');
  }

  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new BookingValidationError('This booking has already been cancelled.', 400, 'ALREADY_CANCELLED');
  }

  const trip = booking.tripId;
  if (!trip) {
    throw new BookingValidationError('Associated trip information could not be found.', 404, 'TRIP_NOT_FOUND');
  }

  // Fetch active cancellation policy
  const activePolicy = await CancellationPolicy.findOne({ active: true });

  // Calculate refund
  const refundInfo = calculateRefund({
    departureAt: trip.departureAt,
    totalAmount: booking.totalAmount,
    policy: activePolicy
  });

  if (!refundInfo.isEligible && new Date(trip.departureAt).getTime() <= Date.now()) {
    throw new BookingValidationError('Cannot cancel ticket after the trip departure time has passed.', 400, 'TRIP_DEPARTED');
  }

  const session = await mongoose.startSession();

  try {
    let hasTransaction = false;
    try {
      session.startTransaction();
      hasTransaction = true;
    } catch (e) {
      hasTransaction = false;
    }

    const sessionOption = hasTransaction ? { session } : {};

    // 1. Release seats back to AVAILABLE
    await SeatInventory.updateMany(
      {
        tripId: trip._id,
        seatNumber: { $in: booking.seatNumbers }
      },
      {
        $set: {
          status: SEAT_STATUS.AVAILABLE,
          bookingId: null
        }
      },
      sessionOption
    );

    // 2. Update booking record
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.refundAmount = refundInfo.refundAmount;
    booking.refundStatus = refundInfo.refundStatus;
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      cancellationReason,
      refundPercentage: refundInfo.refundPercentage,
      hoursBeforeDeparture: refundInfo.hoursRemaining
    };

    await booking.save(sessionOption);

    // 3. Log audit event
    await logAuditEvent({
      actorId: user._id,
      actorRole: user.role,
      action: 'BOOKING_CANCELLED',
      entityType: 'Booking',
      entityId: booking._id,
      summary: `Booking ${booking.pnr} cancelled by ${user.role} ${user.name || user._id}. Simulated refund: ₹${refundInfo.refundAmount} (${refundInfo.refundPercentage}%).`,
      details: {
        pnr: booking.pnr,
        releasedSeats: booking.seatNumbers,
        refundAmount: refundInfo.refundAmount,
        refundPercentage: refundInfo.refundPercentage,
        refundStatus: refundInfo.refundStatus
      }
    }, hasTransaction ? session : null);

    if (hasTransaction) {
      await session.commitTransaction();
    }

    return {
      booking,
      refundInfo
    };
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
};
