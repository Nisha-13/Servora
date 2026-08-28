import Joi from 'joi';

export const createReviewSchema = Joi.object({
  bookingId: Joi.string().hex().length(24).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().min(3).max(1000).required()
});

export const replyReviewSchema = Joi.object({
  comment: Joi.string().min(2).max(1000).required()
});
