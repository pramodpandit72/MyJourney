import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS, REFUND_STATUS } from '../config/constants.js';

const passengerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Passenger age is required'],
      min: 1,
      max: 120
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: 'OTHER'
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: [true, 'PNR is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true
    },
    boardingStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: [true, 'Boarding stop is required']
    },
    droppingStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: [true, 'Dropping stop is required']
    },
    passengers: {
      type: [passengerSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 1;
        },
        message: 'A booking must have at least one passenger.'
      }
    },
    seatNumbers: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 1;
        },
        message: 'A booking must reserve at least one seat.'
      }
    },
    fareBreakdown: {
      perPassengerFare: { type: Number, default: 0 },
      baseFareTotal: { type: Number, default: 0 },
      gstAmount: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 }
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.SIMULATED_SUCCESS
    },
    cancellationDetails: {
      cancelledAt: { type: Date, default: null },
      cancellationReason: { type: String, default: '' },
      refundPercentage: { type: Number, default: 0 },
      hoursBeforeDeparture: { type: Number, default: 0 }
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: Object.values(REFUND_STATUS),
      default: REFUND_STATUS.NOT_APPLICABLE
    },
    bookingDate: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ userId: 1, bookingDate: -1 });
bookingSchema.index({ tripId: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);

