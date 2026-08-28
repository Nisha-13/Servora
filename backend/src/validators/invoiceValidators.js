import Joi from 'joi';

export const createInvoiceSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
  items: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      type: Joi.string().valid('SERVICE', 'LABOR', 'PARTS', 'EXTRA').default('SERVICE'),
      description: Joi.string().allow('').optional()
    })
  ).optional(),
  serviceFee: Joi.number().min(0).optional(),
  laborFee: Joi.number().min(0).optional(),
  partsFee: Joi.number().min(0).optional(),
  extraFee: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(1).optional(),
  notes: Joi.string().allow('').optional(),
  dueDate: Joi.date().iso().optional()
});
