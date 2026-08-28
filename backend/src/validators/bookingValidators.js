import Joi from 'joi';
import { ALL_BOOKING_STATUSES } from '../constants/bookingStatus.js';

export const createBookingSchema = Joi.object({
  serviceId: Joi.string().hex().length(24).required(),
  bookingDate: Joi.date().iso().required(),
  timeSlot: Joi.string().required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().allow('').optional(),
    zipCode: Joi.string().allow('').optional()
  }).required(),
  notes: Joi.string().allow('').max(500).optional()
});

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid(...ALL_BOOKING_STATUSES).required(),
  note: Joi.string().allow('').optional(),
  reason: Joi.string().allow('').optional()
});
