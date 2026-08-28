import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userEmail: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ['USER', 'CATEGORY', 'SERVICE', 'BOOKING', 'INVOICE', 'PAYMENT', 'REVIEW', 'SYSTEM'],
      default: 'SYSTEM'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
