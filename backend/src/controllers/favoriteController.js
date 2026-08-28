import { favoriteService } from '../services/favoriteService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class FavoriteController {
  static async toggleFavorite(req, res, next) {
    try {
      const { providerId, serviceId } = req.body;
      const result = await favoriteService.toggleFavorite(req.user._id, { providerId, serviceId });
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }

  static async getFavorites(req, res, next) {
    try {
      const result = await favoriteService.getCustomerFavorites(req.user._id, req.query);
      return ApiResponse.success(res, 'Favorites retrieved successfully', result);
    } catch (err) {
      next(err);
    }
  }

  static async checkFavorite(req, res, next) {
    try {
      const { providerId, serviceId } = req.query.serviceId ? req.query : req.params;
      const result = await favoriteService.checkIsFavorite(req.user._id, {
        providerId: req.params.providerId || req.query.providerId,
        serviceId: req.params.serviceId || req.query.serviceId
      });
      return ApiResponse.success(res, 'Favorite status checked', result);
    } catch (err) {
      next(err);
    }
  }

  static async deleteFavorite(req, res, next) {
    try {
      const result = await favoriteService.deleteFavorite(req.user._id, req.params.id);
      return ApiResponse.success(res, result.message, result);
    } catch (err) {
      next(err);
    }
  }
}
