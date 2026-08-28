import { adminService } from '../services/adminService.js';
import { userRepository } from '../repositories/userRepository.js';
import { activityLogService } from '../services/activityLogService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AdminController {
  static async getDashboard(req, res, next) {
    try {
      const data = await adminService.getDashboardStats();
      return ApiResponse.success(res, 'Admin dashboard statistics retrieved', data);
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const result = await userRepository.findUsers(req.query);
      return ApiResponse.success(res, 'Users retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async toggleUserStatus(req, res, next) {
    try {
      const user = await adminService.toggleUserStatus(req.params.id, req.user, req);
      return ApiResponse.success(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, { user });
    } catch (err) {
      next(err);
    }
  }

  static async verifyProvider(req, res, next) {
    try {
      const { isVerified } = req.body;
      const provider = await adminService.verifyProvider(req.params.id, isVerified, req.user, req);
      return ApiResponse.success(res, `Provider verification set to ${isVerified}`, { provider });
    } catch (err) {
      next(err);
    }
  }

  static async getActivityLogs(req, res, next) {
    try {
      const result = await activityLogService.getLogs(req.query);
      return ApiResponse.success(res, 'Activity logs retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async getReports(req, res, next) {
    try {
      const reports = await adminService.getReports();
      return ApiResponse.success(res, 'Platform reports retrieved', reports);
    } catch (err) {
      next(err);
    }
  }
}
