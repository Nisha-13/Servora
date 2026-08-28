import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  group: Joi.string().valid('Home Services', 'Automotive', 'Technology', 'Personal Care', 'Professional').required(),
  description: Joi.string().allow('').optional(),
  icon: Joi.string().allow('').optional(),
  image: Joi.string().allow('').optional(),
  order: Joi.number().integer().optional()
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  group: Joi.string().valid('Home Services', 'Automotive', 'Technology', 'Personal Care', 'Professional').optional(),
  description: Joi.string().allow('').optional(),
  icon: Joi.string().allow('').optional(),
  image: Joi.string().allow('').optional(),
  isActive: Joi.boolean().optional(),
  order: Joi.number().integer().optional()
});

export const refundSchema = Joi.object({
  reason: Joi.string().min(3).required()
});
