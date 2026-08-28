import Joi from 'joi';

export const createServiceSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),
  category: Joi.string().hex().length(24).required(),
  description: Joi.string().min(10).required(),
  startingPrice: Joi.number().min(0).required(),
  estimatedDuration: Joi.string().required(),
  serviceArea: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional()
});

export const updateServiceSchema = Joi.object({
  name: Joi.string().min(3).max(150).optional(),
  category: Joi.string().hex().length(24).optional(),
  description: Joi.string().min(10).optional(),
  startingPrice: Joi.number().min(0).optional(),
  estimatedDuration: Joi.string().optional(),
  serviceArea: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional()
});
