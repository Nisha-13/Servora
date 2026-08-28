import { AppError } from '../utils/appError.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(`Forbidden. Your role (${req.user.role}) does not have permission to access this resource.`, 403)
      );
    }

    next();
  };
};
