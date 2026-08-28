import mongoose from 'mongoose';
import { BOOKING_STATUS, ALL_BOOKING_STATUSES } from '../constants/bookingStatus.js';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ALL_BOOKING_STATUSES,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required']
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider is required']
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required']
    },
    startingPrice: {
      type: Number,
      required: true
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required']
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' }
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ALL_BOOKING_STATUSES,
      default: BOOKING_STATUS.PENDING
    },
    statusHistory: [statusHistorySchema],
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    },
    cancelReason: {
      type: String,
      default: ''
    },
    disputeReason: {
      type: String,
      default: ''
    },
    hasReview: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
