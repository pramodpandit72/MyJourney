import mongoose from 'mongoose';
import { SEAT_STATUS } from '../config/constants.js';

const seatInventorySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.AVAILABLE,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// CRITICAL DATABASE INTEGRITY RULE: Unique compound index on tripId + seatNumber
seatInventorySchema.index({ tripId: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model('SeatInventory', seatInventorySchema);

