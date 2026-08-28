import { AppError } from '../utils/appError.js';

export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));
      return next(new AppError('Validation Error', 400, errorMessages));
    }

    req[property] = value;
    next();
  };
};
