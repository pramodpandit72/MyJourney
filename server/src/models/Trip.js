import mongoose from 'mongoose';
import { TRIP_STATUS } from '../config/constants.js';

const tripSchema = new mongoose.Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route is required'],
      index: true
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus is required'],
      index: true
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: [true, 'Operator is required'],
      index: true
    },
    departureAt: {
      type: Date,
      required: [true, 'Departure date and time is required'],
      index: true
    },
    arrivalAt: {
      type: Date,
      required: [true, 'Arrival date and time is required']
    },
    baseFare: {
      type: Number,
      required: [true, 'Base fare is required'],
      min: [1, 'Base fare must be positive']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: Object.values(TRIP_STATUS),
      default: TRIP_STATUS.SCHEDULED,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to help query trips by route and departure
tripSchema.index({ routeId: 1, departureAt: 1, status: 1 });

export default mongoose.model('Trip', tripSchema);

