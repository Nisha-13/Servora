import mongoose from 'mongoose';
import { INVOICE_STATUS } from '../constants/paymentStatus.js';

const invoiceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['SERVICE', 'LABOR', 'PARTS', 'EXTRA'],
      default: 'SERVICE'
    },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [invoiceItemSchema],
    serviceFee: { type: Number, default: 0, min: 0 },
    laborFee: { type: Number, default: 0, min: 0 },
    partsFee: { type: Number, default: 0, min: 0 },
    extraFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      default: 'CASH_ON_DELIVERY'
    },
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.PENDING
    },
    notes: { type: String, default: '' },
    dueDate: { type: Date },
    paidAt: { type: Date },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

invoiceSchema.index({ booking: 1 });
invoiceSchema.index({ customer: 1, status: 1 });
invoiceSchema.index({ provider: 1, status: 1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
