import { authService } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await authService.register(req.body, req);
      return ApiResponse.created(res, 'Registration successful', result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await authService.login(req.body, req);
      return ApiResponse.success(res, 'Login successful', result);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user._id);
      return ApiResponse.success(res, 'User profile retrieved', { user });
    } catch (err) {
      next(err);
    }
  }
}
