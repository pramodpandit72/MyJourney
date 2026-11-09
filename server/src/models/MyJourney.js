import mongoose from 'mongoose';

const myJourneySchema = new mongoose.Schema(
  {
    type: {
      type: String, // 'BOOKING' | 'TRIP' | 'ROUTE' | 'SUMMARY'
      default: 'BOOKING',
      index: true
    },
    pnr: {
      type: String,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      index: true
    },
    routeName: {
      type: String,
      default: ''
    },
    originCity: {
      type: String,
      default: ''
    },
    destinationCity: {
      type: String,
      default: ''
    },
    boardingStop: {
      type: String,
      default: ''
    },
    droppingStop: {
      type: String,
      default: ''
    },
    departureAt: {
      type: Date
    },
    arrivalAt: {
      type: Date
    },
    busType: {
      type: String,
      default: ''
    },
    busRegistration: {
      type: String,
      default: ''
    },
    operatorName: {
      type: String,
      default: ''
    },
    passengers: {
      type: Array,
      default: []
    },
    seatNumbers: {
      type: [String],
      default: []
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    fareBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      default: 'CONFIRMED'
    },
    paymentStatus: {
      type: String,
      default: 'SIMULATED_SUCCESS'
    },
    cancellationDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      default: 'NOT_APPLICABLE'
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    journeyDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: 'myjourneycollection'
  }
);

export default mongoose.model('MyJourney', myJourneySchema, 'myjourneycollection');

