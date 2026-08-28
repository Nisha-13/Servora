import { providerService } from '../services/providerService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ProviderController {
  static async getProviders(req, res, next) {
    try {
      const result = await providerService.getProviders(req.query);
      return ApiResponse.success(res, 'Providers retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async getProviderById(req, res, next) {
    try {
      const result = await providerService.getProviderById(req.params.id);
      return ApiResponse.success(res, 'Provider details retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async updateAvailability(req, res, next) {
    try {
      const availability = await providerService.updateAvailability(req.user._id, req.body);
      return ApiResponse.success(res, 'Availability updated successfully', { availability });
    } catch (err) {
      next(err);
    }
  }

  static async getEarnings(req, res, next) {
    try {
      const earnings = await providerService.getProviderEarnings(req.user._id);
      return ApiResponse.success(res, 'Earnings data retrieved', earnings);
    } catch (err) {
      next(err);
    }
  }

  static async getDashboardStats(req, res, next) {
    try {
      const dashboardData = await providerService.getProviderDashboardStats(req.user._id);
      return ApiResponse.success(res, 'Provider dashboard stats retrieved', dashboardData);
    } catch (err) {
      next(err);
    }
  }
}
