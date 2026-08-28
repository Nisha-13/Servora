import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

// General API limiter — generous in dev to avoid blocking during testing
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 5000 : 500,  // 5000 in dev, 500 in production
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // Skip entirely in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: []
  }
});

// Auth limiter — stricter, but still relaxed in dev
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 30, // 200 in dev, 30 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    errors: []
  }
});
