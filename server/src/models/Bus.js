import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: [true, 'Operator is required'],
      index: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    busType: {
      type: String,
      required: [true, 'Bus type is required']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: 1
    },
    seatLayout: {
      layoutType: {
        type: String,
        default: '2+2'
      },
      rows: {
        type: Number,
        default: 10
      },
      columns: {
        type: Number,
        default: 4
      },
      hasUpperDeck: {
        type: Boolean,
        default: false
      },
      seats: [
        {
          seatNumber: { type: String, required: true },
          row: { type: Number, required: true },
          col: { type: Number, required: true },
          deck: { type: String, enum: ['LOWER', 'UPPER'], default: 'LOWER' },
          type: { type: String, enum: ['SEATER', 'SLEEPER'], default: 'SEATER' }
        }
      ]
    },
    amenities: {
      type: [String],
      default: ['Charging Point', 'Reading Light', 'Water Bottle']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Bus', busSchema);

