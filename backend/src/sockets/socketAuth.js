import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return next(new Error('User not found or account is inactive'));
    }

    socket.user = user;
    next();
  } catch (err) {
    logger.warn(`[Socket Auth Error]: ${err.message}`);
    next(new Error('Invalid or expired authentication token'));
  }
};
