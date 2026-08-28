import Joi from 'joi';
import { ALL_ROLES } from '../constants/roles.js';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid(...ALL_ROLES).optional(),
  phone: Joi.string().allow('', null).optional(),
  address: Joi.object({
    street: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
    zipCode: Joi.string().allow('').optional()
  }).optional(),
  bio: Joi.string().allow('').optional(),
  experienceYears: Joi.number().min(0).optional(),
  serviceCategories: Joi.array().items(Joi.string()).optional(),
  serviceAreas: Joi.array().items(Joi.string()).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().allow('', null).optional(),
  avatar: Joi.string().allow('', null).optional(),
  bio: Joi.string().allow('', null).optional(),
  experienceYears: Joi.number().min(0).optional(),
  serviceAreas: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  serviceCategories: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
  address: Joi.object({
    street: Joi.string().allow('', null).optional(),
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    zipCode: Joi.string().allow('', null).optional()
  }).optional(),
  providerProfile: Joi.object({
    bio: Joi.string().allow('', null).optional(),
    experienceYears: Joi.number().min(0).optional(),
    serviceAreas: Joi.array().items(Joi.string()).optional(),
    availability: Joi.object({
      days: Joi.array().items(Joi.string()).optional(),
      startTime: Joi.string().optional(),
      endTime: Joi.string().optional(),
      isAvailable: Joi.boolean().optional()
    }).optional()
  }).optional()
}).unknown(true);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required()
});
