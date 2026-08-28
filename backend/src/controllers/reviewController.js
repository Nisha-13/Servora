import { reviewService } from '../services/reviewService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ReviewController {
  static async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.body, req.user, req);
      return ApiResponse.created(res, 'Review submitted successfully', { review });
    } catch (err) {
      next(err);
    }
  }

  static async replyToReview(req, res, next) {
    try {
      const review = await reviewService.replyToReview(req.params.id, req.body.comment, req.user);
      return ApiResponse.success(res, 'Reply added to review', { review });
    } catch (err) {
      next(err);
    }
  }

  static async getReviews(req, res, next) {
    try {
      const result = await reviewService.getReviews(req.query);
      return ApiResponse.success(res, 'Reviews retrieved', result);
    } catch (err) {
      next(err);
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const result = await reviewService.deleteReview(req.params.id, req.user, req);
      return ApiResponse.success(res, result.message);
    } catch (err) {
      next(err);
    }
  }
}
