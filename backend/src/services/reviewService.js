import { reviewRepository } from '../repositories/reviewRepository.js';
import { bookingRepository } from '../repositories/bookingRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { notificationService } from './notificationService.js';
import { activityLogService } from './activityLogService.js';
import { cacheService } from './cacheService.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';
import { ACTIVITY_ACTIONS } from '../constants/activityActions.js';
import { AppError } from '../utils/appError.js';

export class ReviewService {
  async recalculateRatings(providerId, serviceId) {
    // 1. Recalculate provider ratings
    const providerStats = await reviewRepository.getProviderRatingStats(providerId);
    await userRepository.updateById(providerId, {
      'providerProfile.rating': providerStats.avgRating,
      'providerProfile.reviewCount': providerStats.totalReviews
    });

    // 2. Recalculate service ratings
    if (serviceId) {
      const serviceStats = await reviewRepository.getServiceRatingStats(serviceId);
      await serviceRepository.updateById(serviceId, {
        rating: serviceStats.avgRating,
        reviewCount: serviceStats.totalReviews
      });
    }

    // Invalidate caches
    await cacheService.delPattern('providers:*');
    await cacheService.delPattern('services:*');
  }

  async createReview(data, customerUser, req = null) {
    const booking = await bookingRepository.findById(data.bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    // Only customer who booked can review
    if (booking.customer._id.toString() !== customerUser._id.toString()) {
      throw new AppError('You can only review services you have booked', 403);
    }

    // Must be in PAID status
    if (booking.status !== BOOKING_STATUS.PAID) {
      throw new AppError('You can only review services after completion and payment', 400);
    }

    // Check if already reviewed
    const existing = await reviewRepository.findByBookingId(booking._id);
    if (existing) {
      throw new AppError('You have already reviewed this service booking', 400);
    }

    const review = await reviewRepository.create({
      booking: booking._id,
      customer: customerUser._id,
      provider: booking.provider._id,
      service: booking.service._id,
      rating: Number(data.rating),
      comment: data.comment
    });

    // Mark booking as hasReview = true
    booking.hasReview = true;
    await booking.save();

    // Recalculate ratings
    await this.recalculateRatings(booking.provider._id, booking.service._id);

    // Notify provider
    await notificationService.sendNotification({
      recipient: booking.provider._id,
      sender: customerUser._id,
      type: NOTIFICATION_TYPES.REVIEW_RECEIVED,
      title: 'New Customer Review',
      message: `${customerUser.name} rated your service ${data.rating} stars: "${data.comment.slice(0, 60)}..."`,
      data: { bookingId: booking._id }
    });

    await activityLogService.log({
      user: customerUser,
      action: ACTIVITY_ACTIONS.REVIEW_SUBMITTED,
      description: `Review (${data.rating} stars) submitted for booking #${booking.bookingNumber}`,
      entityType: 'REVIEW',
      entityId: review._id,
      req
    });

    return reviewRepository.findById(review._id);
  }

  async replyToReview(reviewId, comment, providerUser) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);

    if (review.provider._id.toString() !== providerUser._id.toString() && providerUser.role !== 'ADMIN') {
      throw new AppError('Only the reviewed provider can reply to this review', 403);
    }

    review.providerReply = {
      comment,
      repliedAt: new Date()
    };
    await review.save();

    return review;
  }

  async getReviews(query) {
    return reviewRepository.findReviews(query);
  }

  async deleteReview(reviewId, adminUser, req = null) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);

    await reviewRepository.deleteById(reviewId);
    await this.recalculateRatings(review.provider._id, review.service._id);

    await activityLogService.log({
      user: adminUser,
      action: ACTIVITY_ACTIONS.ADMIN_MODERATION,
      description: `Review ${reviewId} removed by admin`,
      entityType: 'REVIEW',
      entityId: review._id,
      req
    });

    return { message: 'Review deleted successfully' };
  }
}

export const reviewService = new ReviewService();
