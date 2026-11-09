import mongoose from 'mongoose';

const refundTierSchema = new mongoose.Schema(
  {
    minHoursBeforeDeparture: {
      type: Number,
      required: true,
      min: 0
    },
    refundPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  { _id: false }
);

const cancellationPolicySchema = new mongoose.Schema(
  {
    policyName: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
      default: 'Standard YatraSetu Cancellation Policy'
    },
    refundTiers: {
      type: [refundTierSchema],
      default: [
        { minHoursBeforeDeparture: 24, refundPercentage: 100 },
        { minHoursBeforeDeparture: 6, refundPercentage: 50 },
        { minHoursBeforeDeparture: 0, refundPercentage: 0 }
      ]
    },
    active: {
      type: Boolean,
      default: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('CancellationPolicy', cancellationPolicySchema);

