import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { config } from '../config/environment.js';
import { AppError } from '../utils/appError.js';
import { activityLogService } from './activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';
import { ROLES } from '../constants/roles.js';

export class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async register(userData, req = null) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('An account with this email already exists', 400);
    }

    // Default to CUSTOMER if role is not valid or trying to register ADMIN
    let role = userData.role || ROLES.CUSTOMER;
    if (role === ROLES.ADMIN) {
      role = ROLES.CUSTOMER; // Admins cannot be registered publicly
    }

    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role,
      phone: userData.phone || '',
      address: userData.address || {}
    };

    if (role === ROLES.PROVIDER) {
      payload.providerProfile = {
        bio: userData.bio || '',
        experienceYears: userData.experienceYears || 0,
        serviceCategories: userData.serviceCategories || [],
        serviceAreas: userData.serviceAreas || [],
        availability: userData.availability || {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true
        }
      };
    }

    const user = await userRepository.create(payload);
    const token = this.generateToken(user);

    await activityLogService.log({
      user,
      action: ACTIVITY_ACTIONS.USER_REGISTERED,
      description: `New ${user.role.toLowerCase()} registered: ${user.name} (${user.email})`,
      entityType: 'USER',
      entityId: user._id,
      req
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    return { user: safeUser, token };
  }

  async login({ email, password }, req = null) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    await activityLogService.log({
      user,
      action: ACTIVITY_ACTIONS.USER_LOGGED_IN,
      description: `User logged in: ${user.name} (${user.email})`,
      entityType: 'USER',
      entityId: user._id,
      req
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    return { user: safeUser, token };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

export const authService = new AuthService();
