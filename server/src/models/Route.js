import mongoose from 'mongoose';

const routeStopSchema = new mongoose.Schema(
  {
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: true
    },
    stopOrder: {
      type: Number,
      required: true
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    timeOffsetMinutes: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true
    },
    routeCode: {
      type: String,
      required: [true, 'Route code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    stops: {
      type: [routeStopSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: 'A route must have at least two stops.'
      }
    },
    totalDistance: {
      type: Number,
      required: true,
      min: 1
    },
    estimatedDuration: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Route', routeSchema);

