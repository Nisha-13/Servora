import { userService } from '../services/userService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await userService.getUserProfile(req.user._id);
      return ApiResponse.success(res, 'Profile retrieved', { user });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      let updateData = { ...req.body };
      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        updateData.avatar = `${baseUrl}/uploads/${req.file.filename}`;
      }
      const user = await userService.updateProfile(req.user._id, updateData, req);
      return ApiResponse.success(res, 'Profile updated successfully', { user });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const result = await userService.changePassword(req.user._id, req.body, req);
      return ApiResponse.success(res, result.message);
    } catch (err) {
      next(err);
    }
  }
}
