import mongoose from 'mongoose';

const privacySettingsSchema = new mongoose.Schema(
  {
    maskPassengerPii: {
      type: Boolean,
      default: true,
      description: 'Mask passenger contact phone numbers and emails on manifests and public views'
    },
    restrictCrossStateViewing: {
      type: Boolean,
      default: true,
      description: 'Strictly isolate state administration so state admins cannot view other states'
    },
    requireConsentForBooking: {
      type: Boolean,
      default: true,
      description: 'Require passenger explicit consent for data processing under DPDP Act 2023'
    },
    auditLogRetentionDays: {
      type: Number,
      default: 180,
      description: 'Number of days audit logs are retained before archival'
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

export default mongoose.model('PrivacySettings', privacySettingsSchema);
